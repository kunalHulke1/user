import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { Camera, Utensils, Building, ChevronRight, Calendar, ArrowLeft, MapPin, Users, IndianRupee } from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';
import { getMandapDetailsById, getPhotographersByMandapId, getCaterersByMandapId, getRoomsByMandapId } from '../services/mandapServices';

const Booking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedDate = searchParams.get('date');
  
  const [selectedDates, setSelectedDates] = useState<Date[]>(
    preSelectedDate ? [new Date(preSelectedDate)] : []
  );
  const [mandap, setMandap] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);
  const [photographerList, setPhotographerList] = useState<any[]>([]);
  const [catererList, setCatererList] = useState<any[]>([]);
  const [roomList, setRoomList] = useState<any>({});
  const [availableDates, setAvailableDates] = useState<Date[]>([]);
  const [formData, setFormData] = useState({
    address: '',
    includePhotography: false,
    includeCatering: false,
    includeRooms: false,
    selectedPhotographer: '',
    photographyCategory: '',
    photographyPrice: 0,
    selectedCaterer: '',
    cateringPlan: '',
    acRooms: 0,
    nonAcRooms: 0
  });

  const fetchMandapDetails = async () => {
    try {
      setIsLoading(true);
      const result = await getMandapDetailsById(id!);
      const mandapData = result.data.data.mandap;
      setMandap(mandapData);
      setAvailableDates(mandapData.availableDates.map((date: string) => new Date(date)));
    } catch (error) {
      console.error('Error fetching mandap details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPhotographerList = async () => {
    try {
      const result = await getPhotographersByMandapId(id!);
      setPhotographerList(result.data.data.photographers);
    } catch (error) {
      console.error('Error fetching photographer list:', error);
    }
  };

  const getCatererList = async () => {
    try {
      const result = await getCaterersByMandapId(id!);
      setCatererList(result.data.data.caterers);
    } catch (error) {
      console.error('Error fetching caterer list:', error);
    }
  };

  const getRoomsList = async () => {
    try {
      const result = await getRoomsByMandapId(id!);
      setRoomList(result.data.data.rooms);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMandapDetails();
      getPhotographerList();
      getCatererList();
      getRoomsList();
    }
  }, [id]);

  const calculateTotalPrice = () => {
    let total = mandap.venuePricing || 0;

    // Photography
    if (formData.includePhotography && formData.selectedPhotographer && formData.photographyCategory) {
      const photographer = photographerList.find(p => p._id === formData.selectedPhotographer);
      const selectedType = photographer?.photographyTypes.find(pt => pt.phtype === formData.photographyCategory);
      if (selectedType) {
        total += selectedType.pricePerEvent;
      }
    }

    // Catering
    if (formData.includeCatering && formData.selectedCaterer && formData.cateringPlan) {
      const caterer = catererList.find(c => c._id === formData.selectedCaterer);
      const plan = caterer?.plans?.find(p => p.name === formData.cateringPlan);
      if (plan) {
        total += plan.price;
      }
    }

    // Rooms
    if (formData.includeRooms && roomList) {
      total += (formData.acRooms * (roomList.AcRoom?.pricePerNight || 0)) + 
               (formData.nonAcRooms * (roomList.NonAcRoom?.pricePerNight || 0));
    }

    return total;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDates.length === 0) {
      alert('Please select at least one date for your event');
      return;
    }

    if (!formData.address.trim()) {
      alert('Please enter the event address');
      return;
    }
    
    try {
      const stripe = await loadStripe('your_publishable_key');
      
      // Here you would typically make an API call to your backend to create a payment intent
      // For now, we'll just redirect to the Stripe setup page
      window.location.href = 'https://bolt.new/setup/stripe';
    } catch (error) {
      console.error('Error:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate(-1)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Venue Details
            </button>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Complete Your Booking</h1>
            <div></div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Main Booking Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-8">
              {/* Venue Summary */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Venue Details</h2>
                <div className="flex items-start gap-4">
                  <img 
                    src={mandap.venueImages?.[0]} 
                    alt={mandap.mandapName}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold">{mandap.mandapName}</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="w-4 h-4 mr-1" />
                      <span className="text-sm">{mandap.address?.city}</span>
                    </div>
                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <div className="flex items-center">
                        <Users className="w-4 h-4 mr-1" />
                        <span>{mandap.guestCapacity} guests</span>
                      </div>
                      <div className="flex items-center">
                        <IndianRupee className="w-4 h-4 mr-1" />
                        <span>₹{mandap.venuePricing?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Date Selection */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <label className="block text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <Calendar className="w-5 h-5 mr-2 text-blue-600" />
                  Select Your Event Dates
                </label>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-64 overflow-y-auto border rounded-xl p-4 bg-gray-50">
                  {availableDates.map((date, index) => (
                    <label key={index} className="flex items-center space-x-3 cursor-pointer p-3 rounded-lg hover:bg-blue-50 transition-colors bg-white border">
                      <input
                        type="checkbox"
                        checked={selectedDates.some(d => d.getTime() === date.getTime())}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedDates([...selectedDates, date]);
                          } else {
                            setSelectedDates(selectedDates.filter(d => d.getTime() !== date.getTime()));
                          }
                        }}
                        className="rounded w-4 h-4 text-blue-600"
                      />
                      <span className="text-sm font-medium">{date.toLocaleDateString()}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Address Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <label className="block text-lg font-semibold text-gray-800 mb-4">
                  Event Address
                </label>
                <textarea
                  required
                  className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                  rows={3}
                  placeholder="Enter the complete address for your event..."
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                />
              </div>

              {/* Photography Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Camera className="w-6 h-6 mr-3 text-purple-600" />
                    <div>
                      <span className="text-lg font-semibold">Photography Services</span>
                      <p className="text-sm text-gray-600">Capture your special moments</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.includePhotography}
                      onChange={(e) => setFormData({ ...formData, includePhotography: e.target.checked })}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                {formData.includePhotography && (
                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] bg-white rounded-lg overflow-hidden shadow-sm border">
                        <thead>
                          <tr className="bg-gradient-to-r from-purple-500 to-blue-500 text-white">
                            <th className="px-4 py-3 text-left text-sm font-semibold">Select</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Photographer</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Category</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Price</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {photographerList.map((photographer, index) => (
                            <tr key={index} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedPhotographer === photographer._id}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    selectedPhotographer: e.target.checked ? photographer._id : ''
                                  })}
                                  className="w-4 h-4 text-blue-600 rounded"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">{photographer.photographerName}</td>
                              <td className="px-4 py-3">
                                <select
                                  className="border rounded-lg px-3 py-2 text-sm w-full focus:ring-2 focus:ring-blue-500"
                                  onChange={(e) => {
                                    const selectedCategory = e.target.value;
                                    const selectedPhotographer = photographerList.find(p => p._id === formData.selectedPhotographer);
                                    const selectedType = selectedPhotographer?.photographyTypes.find(pt => pt.phtype === selectedCategory);
                                    setFormData({ ...formData, photographyCategory: selectedCategory, photographyPrice: selectedType ? selectedType.pricePerEvent : 0 });
                                  }}
                                  disabled={formData.selectedPhotographer !== photographer._id}
                                >
                                  <option value="">Select Category</option>
                                  {photographer.photographyTypes?.map((category: any, index: number) => (
                                    <option key={index} value={category.phtype}>{category.phtype}</option>
                                  ))}
                                </select>
                              </td>
                              <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                ₹{photographer.photographyTypes?.[0]?.pricePerEvent || 0}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/photographer/${photographer._id}`)}
                                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium hover:underline"
                                >
                                  View Work
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Catering Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Utensils className="w-6 h-6 mr-3 text-green-600" />
                    <div>
                      <span className="text-lg font-semibold">Catering Services</span>
                      <p className="text-sm text-gray-600">Delicious food for your guests</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.includeCatering}
                      onChange={(e) => setFormData({ ...formData, includeCatering: e.target.checked })}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-green-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-green-600"></div>
                  </label>
                </div>

                {formData.includeCatering && (
                  <div className="space-y-6">
                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[600px] bg-white rounded-lg overflow-hidden shadow-sm border">
                        <thead>
                          <tr className="bg-gradient-to-r from-green-500 to-blue-500 text-white">
                            <th className="px-4 py-3 text-left text-sm font-semibold">Select</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Caterer</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Food Type</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Price/Plate</th>
                            <th className="px-4 py-3 text-left text-sm font-semibold">Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {catererList.map((caterer, index) => (
                            <tr key={caterer._id} className="border-t hover:bg-gray-50">
                              <td className="px-4 py-3">
                                <input
                                  type="checkbox"
                                  checked={formData.selectedCaterer === caterer._id}
                                  onChange={(e) => setFormData({ 
                                    ...formData, 
                                    selectedCaterer: e.target.checked ? caterer._id : '' 
                                  })}
                                  className="w-4 h-4 text-green-600 rounded"
                                />
                              </td>
                              <td className="px-4 py-3 text-sm font-medium">{caterer.catererName}</td>
                              <td className="px-4 py-3 text-sm">{caterer.foodType}</td>
                              <td className="px-4 py-3 text-sm font-semibold text-green-600">
                                ₹{caterer.menuCategory?.pricePerPlate || 0}
                              </td>
                              <td className="px-4 py-3">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/caterer/${caterer._id}`)}
                                  className="text-blue-600 hover:text-blue-800 flex items-center text-sm font-medium hover:underline"
                                >
                                  View Details
                                  <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

              {/* Rooms Section */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center">
                    <Building className="w-6 h-6 mr-3 text-orange-600" />
                    <div>
                      <span className="text-lg font-semibold">Room Booking</span>
                      <p className="text-sm text-gray-600">Comfortable stay for your guests</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.includeRooms}
                      onChange={(e) => setFormData({ ...formData, includeRooms: e.target.checked })}
                    />
                    <div className="w-14 h-7 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-orange-600"></div>
                  </label>
                </div>

                {formData.includeRooms && roomList && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {roomList.AcRoom && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-semibold text-gray-700">
                              AC Rooms (₹{roomList.AcRoom.pricePerNight}/night)
                            </label>
                            <button
                              type="button"
                              onClick={() => navigate(`/room/${roomList._id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                            >
                              View Details
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Available: {roomList.AcRoom.noOfRooms} rooms</p>
                          <input
                            type="number"
                            min="0"
                            max={roomList.AcRoom.noOfRooms}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            value={formData.acRooms}
                            onChange={(e) => setFormData({ ...formData, acRooms: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      )}
                      {roomList.NonAcRoom && (
                        <div className="bg-gray-50 p-4 rounded-lg border">
                          <div className="flex justify-between items-center mb-3">
                            <label className="block text-sm font-semibold text-gray-700">
                              Non-AC Rooms (₹{roomList.NonAcRoom.pricePerNight}/night)
                            </label>
                            <button
                              type="button"
                              onClick={() => navigate(`/room/${roomList._id}`)}
                              className="text-blue-600 hover:text-blue-800 text-sm font-medium hover:underline"
                            >
                              View Details
                            </button>
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Available: {roomList.NonAcRoom.noOfRooms} rooms</p>
                          <input
                            type="number"
                            min="0"
                            max={roomList.NonAcRoom.noOfRooms}
                            className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            value={formData.nonAcRooms}
                            onChange={(e) => setFormData({ ...formData, nonAcRooms: parseInt(e.target.value) || 0 })}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 font-semibold shadow-lg transform hover:scale-105 transition-all"
                >
                  Proceed to Payment
                </button>
              </div>
            </form>
          </div>

          {/* Booking Summary Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm p-6 sticky top-8">
              <h3 className="text-lg font-semibold text-gray-700 mb-4">Booking Summary</h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Venue Cost</span>
                  <span className="font-semibold">₹{(mandap.venuePricing || 0).toLocaleString()}</span>
                </div>

                {formData.includePhotography && formData.selectedPhotographer && formData.photographyCategory && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Photography</span>
                    <span className="font-semibold">₹{formData.photographyPrice.toLocaleString()}</span>
                  </div>
                )}

                {formData.includeCatering && formData.selectedCaterer && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Catering</span>
                    <span className="font-semibold">₹{(() => {
                      const caterer = catererList.find(c => c._id === formData.selectedCaterer);
                      return (caterer?.menuCategory?.pricePerPlate || 0).toLocaleString();
                    })()}</span>
                  </div>
                )}

                {formData.includeRooms && (formData.acRooms > 0 || formData.nonAcRooms > 0) && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Accommodation</span>
                    <span className="font-semibold">
                      ₹{((formData.acRooms * (roomList.AcRoom?.pricePerNight || 0)) + 
                         (formData.nonAcRooms * (roomList.NonAcRoom?.pricePerNight || 0))).toLocaleString()}
                    </span>
                  </div>
                )}

                {selectedDates.length > 0 && (
                  <div className="border-t pt-4">
                    <div className="text-sm text-gray-600 mb-2">Selected Dates:</div>
                    <div className="space-y-1">
                      {selectedDates.map((date, index) => (
                        <div key={index} className="text-sm bg-blue-50 px-2 py-1 rounded">
                          {date.toLocaleDateString()}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Amount</span>
                    <span className="text-blue-600">₹{calculateTotalPrice().toLocaleString()}</span>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">All services included</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;
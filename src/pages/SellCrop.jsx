import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, CheckCircle, Leaf, MapPin, IndianRupee, Scale, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../services/api';

export default function SellCrop() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Drag and drop handlers
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const onSubmit = async (data) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append('cropName', data.cropName);
      formData.append('category', data.category);
      formData.append('quantity', data.quantity);
      formData.append('price', data.price);
      formData.append('location', data.location);
      if (imageFile) {
        formData.append('image', imageFile);
      }

      await api.post('/product', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setIsSubmitted(true);
      setTimeout(() => {
        setIsSubmitted(false);
        reset();
        setImageFile(null);
      }, 4000);
    } catch (err) {
      setError(err.response?.data?.message || 'Error listing crop');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-heading font-extrabold text-gray-900 flex items-center justify-center gap-3">
            <Leaf className="h-8 w-8 text-brand-green" />
            Sell Your Crop
          </h2>
          <p className="mt-2 text-gray-600">Enter details of your produce to list it on the marketplace.</p>
        </div>

        <motion.div 
          className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="p-8">
            {error && (
              <div className="mb-6 bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium border border-red-100">
                {error}
              </div>
            )}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Crop Name</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <input
                      {...register("cropName", { required: true })}
                      placeholder="e.g. Organic Wheat"
                      className="block w-full border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 px-4 border bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                  {errors.cropName && <span className="text-red-500 text-xs mt-1 block">Crop name is required</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Crop Category</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <select
                      {...register("category", { required: true })}
                      className="block w-full border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 px-4 border bg-gray-50 focus:bg-white transition-colors"
                    >
                      <option value="">Select a category</option>
                      <option value="Grains">Grains</option>
                      <option value="Vegetables">Vegetables</option>
                      <option value="Fruits">Fruits</option>
                      <option value="Pulses">Pulses</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  {errors.category && <span className="text-red-500 text-xs mt-1 block">Category is required</span>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Quantity <span className="text-gray-400 font-normal">(in Quintals / kg)</span></label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Scale className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("quantity", { required: true })}
                      type="number"
                      placeholder="100 Quintals"
                      className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Expecting Price <span className="text-gray-400 font-normal">(per kg)</span></label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <IndianRupee className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("price", { required: true })}
                      type="number"
                      placeholder="25"
                      className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Farm Location</label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <MapPin className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      {...register("location", { required: true })}
                      placeholder="Village Name, District"
                      className="block w-full pl-10 border-gray-300 rounded-lg focus:ring-brand-green focus:border-brand-green py-3 border bg-gray-50 focus:bg-white transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Drag and Drop Image Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Upload Crop Images</label>
                <div 
                  className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-xl transition-colors ${dragActive ? 'border-brand-green bg-green-50' : 'border-gray-300 bg-gray-50'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <div className="space-y-1 text-center">
                    {imageFile ? (
                      <div className="relative">
                        <img 
                          src={URL.createObjectURL(imageFile)} 
                          alt="Preview" 
                          className="mx-auto h-48 w-48 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            setImageFile(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <>
                        <UploadCloud className={`mx-auto h-12 w-12 ${dragActive ? 'text-brand-green' : 'text-gray-400'}`} />
                        <div className="flex text-sm text-gray-600 justify-center">
                          <label htmlFor="file-upload" className="relative cursor-pointer bg-transparent rounded-md font-medium text-brand-green hover:text-green-700 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-brand-green">
                            <span>Upload a file</span>
                            <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG, GIF up to 5MB
                        </p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit / Success animation */}
              <div className="pt-4 relative">
                <AnimatePresence>
                  {isSubmitted && (
                    <motion.div 
                      className="absolute inset-0 bg-white/95 z-10 flex flex-col items-center justify-center rounded-lg border border-green-200"
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                    >
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200, damping: 10 }}
                      >
                        <CheckCircle className="h-16 w-16 text-brand-green mb-4" />
                      </motion.div>
                      <h3 className="text-xl font-bold text-gray-900">Crop Listed Successfully!</h3>
                      <p className="text-gray-500 mt-2">Buyers will now see your produce.</p>
                      <Link to="/marketplace" className="mt-4 text-brand-green font-medium underline">Go to Marketplace</Link>
                    </motion.div>
                  )}
                </AnimatePresence>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-md text-lg font-medium text-white bg-brand-green hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-green transition-all transform hover:scale-[1.02]"
                >
                  {loading ? 'Listing...' : 'List Crop on Marketplace'}
                </button>
              </div>

            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

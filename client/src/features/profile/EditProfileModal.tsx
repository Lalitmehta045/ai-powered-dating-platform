import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, Loader2, Sparkles } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

import type { User } from '../../store/slices/authSlice';
import { useUpdateProfileMutation, useUploadPhotoMutation } from '../../store/api/profileApi';
import { useGenerateBioMutation } from '../../store/api/aiApi';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

const profileSchema = z.object({
  bio: z.string().max(300, 'Bio must be less than 300 characters').optional(),
  age: z.number().min(18, 'Must be at least 18').max(120).optional(),
  interests: z.string().optional(), // We'll parse this to array
});

type ProfileFormValues = z.infer<typeof profileSchema>;

interface EditProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: User;
}

export const EditProfileModal: React.FC<EditProfileModalProps> = ({ isOpen, onClose, user }) => {
  const [updateProfile, { isLoading }] = useUpdateProfileMutation();
  const [uploadPhoto, { isLoading: isUploading }] = useUploadPhotoMutation();
  const [generateBio, { isLoading: isGenerating }] = useGenerateBioMutation();
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const { register, handleSubmit, setValue, getValues, formState: { errors } } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      bio: user.bio || '',
      age: user.age || undefined,
      interests: user.interests?.join(', ') || '',
    },
  });

  const onSubmit = async (data: ProfileFormValues) => {
    try {
      const interestsArray = data.interests 
        ? data.interests.split(',').map(i => i.trim()).filter(Boolean) 
        : [];
        
      await updateProfile({
        bio: data.bio,
        age: data.age,
        interests: interestsArray,
      }).unwrap();
      
      toast.success('Profile updated successfully!');
      onClose();
    } catch (err) {
      toast.error('Failed to update profile.');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('photo', file);

    try {
      await uploadPhoto(formData).unwrap();
      toast.success('Photo uploaded successfully!');
    } catch (err) {
      toast.error('Failed to upload photo.');
    }
  };

  const handleGenerateBio = async (tone: string) => {
    try {
      const res = await generateBio({ tone, currentBio: getValues('bio') }).unwrap();
      setValue('bio', res.data.bio, { shouldValidate: true });
      toast.success('AI Bio generated! ✨');
    } catch (err) {
      toast.error('Failed to generate bio with AI.');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={onClose} />
          
          <motion.div
            className="relative z-10 w-full max-w-lg bg-card border border-border rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-full"
            initial={{ scale: 0.95, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.95, y: 20 }}
          >
            <div className="flex justify-between items-center p-6 border-b border-border/50">
              <h2 className="text-xl font-bold text-white">Edit Profile</h2>
              <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-text-secondary transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="overflow-y-auto p-6 scrollbar-hide flex-1">
              {/* Image Upload */}
              <div className="mb-8">
                <h3 className="text-sm font-medium text-text-primary mb-3">Profile Picture</h3>
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  className="hidden" 
                  accept="image/*"
                />
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-40 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center bg-background/50 hover:bg-white/5 transition-colors cursor-pointer group relative overflow-hidden"
                >
                  {isUploading ? (
                    <div className="flex flex-col items-center">
                      <Loader2 className="w-10 h-10 text-primary animate-spin mb-2" />
                      <p className="text-sm text-text-secondary">Uploading...</p>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-full glass flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-5 h-5 text-text-primary" />
                      </div>
                      <p className="text-sm text-text-secondary font-medium">Click to upload new image</p>
                    </>
                  )}
                </div>
              </div>

              <form id="edit-profile-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Age</label>
                  <Input 
                    {...register('age', { valueAsNumber: true })} 
                    type="number" 
                    placeholder="25"
                    error={errors.age?.message}
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium text-text-primary">Bio</label>
                    <div className="flex gap-2">
                      {['Funny', 'Romantic', 'Casual'].map(tone => (
                        <button
                          key={tone}
                          type="button"
                          disabled={isGenerating}
                          onClick={() => handleGenerateBio(tone)}
                          className="text-[10px] sm:text-xs px-2 py-1 rounded-full glass border border-secondary/30 text-secondary hover:bg-secondary/10 transition-colors flex items-center gap-1 disabled:opacity-50"
                        >
                          <Sparkles className="w-3 h-3" />
                          {tone}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="relative">
                    <textarea
                      {...register('bio')}
                      rows={4}
                      className="w-full bg-background border border-border rounded-xl px-4 py-3 text-white placeholder-text-secondary focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                      placeholder="Write a little about yourself..."
                    />
                    {isGenerating && (
                      <div className="absolute inset-0 bg-background/50 backdrop-blur-[2px] rounded-xl flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-secondary animate-spin" />
                      </div>
                    )}
                  </div>
                  {errors.bio && <p className="text-danger text-sm mt-1">{errors.bio.message}</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-text-primary mb-2">Interests (comma separated)</label>
                  <Input 
                    {...register('interests')} 
                    placeholder="Coffee, Hiking, Photography"
                    error={errors.interests?.message}
                  />
                </div>
              </form>
            </div>

            <div className="p-6 border-t border-border/50 bg-card/80 backdrop-blur-sm mt-auto">
              <Button 
                type="submit" 
                form="edit-profile-form" 
                className="w-full" 
                isLoading={isLoading}
              >
                Save Changes
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

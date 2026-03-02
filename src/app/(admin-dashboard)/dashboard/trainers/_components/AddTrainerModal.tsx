"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Eye, EyeOff, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const addTrainerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.string(),
});

type AddTrainerFormValues = z.infer<typeof addTrainerSchema>;

interface AddTrainerModalProps {
  open: boolean;
  onClose: () => void;
  accessToken?: string;
}

const AddTrainerModal = ({ open, onClose, accessToken }: AddTrainerModalProps) => {
  const [showPassword, setShowPassword] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<AddTrainerFormValues>({
    resolver: zodResolver(addTrainerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      password: "",
      role: "Trainer",
    },
  });

  const addTrainerMutation = useMutation({
    mutationFn: async (values: AddTrainerFormValues) => {
      const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/trainer`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          name: values.fullName,
          email: values.email,
          phone: values.phone,
          password: values.password,
          role: "TRAINER",
        }),
      });

      const data = await res.json().catch(() => null);

      // ❗if server returned non-2xx
      if (!res.ok) {
        throw new Error(data?.message || "Failed to add trainer");
      }

      // ✅ even if 200, but status false => treat as error
      if (data?.status === false) {
        throw new Error(data?.message || "Something went wrong!");
      }

      return data;
    },

    onSuccess: () => {
      toast.success("Trainer added successfully!");
      queryClient.invalidateQueries({ queryKey: ["trainers"] });

      form.reset({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        role: "Trainer",
      });

      onClose();
    },

    onError: (err: Error) => {
      toast.error(err?.message || "Something went wrong!");
    },
  });

  const onSubmit = (values: AddTrainerFormValues) => {
    addTrainerMutation.mutate(values);
  };

  const isSubmitting = addTrainerMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-[480px] rounded-[16px] p-6 bg-white border-none">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl font-bold text-[#00253E]">
            Add New Trainer
          </DialogTitle>
          <p className="text-sm text-gray-500 mt-1">
            Want to delete this Revenue, remember if you delete this it not show again in your dashboard.
          </p>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
            {/* Full Name */}
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Full Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Butlar Mane"
                      className="h-[48px] border border-gray-300 rounded-[8px] focus:ring-primary placeholder:text-[#616161]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Email */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Butlar@email.com"
                      className="h-[48px] border border-gray-300 rounded-[8px] focus:ring-primary placeholder:text-[#616161]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Phone */}
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Phone Number <span className="text-gray-400 font-normal">(Optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="+997 9384u35803"
                      className="h-[48px] border border-gray-300 rounded-[8px] focus:ring-primary placeholder:text-[#616161]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Password */}
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Password
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••••"
                        className="h-[48px] border border-gray-300 rounded-[8px] pr-10 focus:ring-primary placeholder:text-[#959494]"
                        {...field}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute top-3.5 right-3 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? (
                          <Eye className="w-4 h-4" />
                        ) : (
                          <EyeOff className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Role */}
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-sm font-medium text-gray-700">
                    Role
                  </FormLabel>
                  <FormControl>
                    <Input
                      disabled
                      className="h-[48px] border border-gray-300 rounded-[8px] bg-gray-50"
                      readOnly
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                className="flex items-center gap-2 h-[48px] px-6 rounded-full border-gray-300"
              >
                <X className="w-4 h-4 text-red-500" />
                Cancel
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-2 h-[48px] px-8 rounded-full bg-primary text-[#00253E] font-bold hover:bg-primary/90"
              >
                {isSubmitting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {isSubmitting ? "Adding..." : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default AddTrainerModal;




















// 'use client'

// import { useState } from 'react'
// import { useForm } from 'react-hook-form'
// import { zodResolver } from '@hookform/resolvers/zod'
// import { z } from 'zod'
// import { Eye, EyeOff, Loader2, Plus, X } from 'lucide-react'
// import { toast } from 'sonner'
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog'
// import {
//   Form,
//   FormControl,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormMessage,
// } from '@/components/ui/form'
// import { Input } from '@/components/ui/input'
// import { Button } from '@/components/ui/button'

// const addTrainerSchema = z.object({
//   fullName: z.string().min(2, 'Full name must be at least 2 characters'),
//   email: z.string().email('Please enter a valid email address'),
//   phone: z.string().optional(),
//   password: z.string().min(6, 'Password must be at least 6 characters'),
//   role: z.string(),
// })

// type AddTrainerFormValues = z.infer<typeof addTrainerSchema>

// interface AddTrainerModalProps {
//   open: boolean
//   onClose: () => void
//   // onSuccess: () => void
//   accessToken?: string
// }

// const AddTrainerModal = ({
//   open,
//   onClose,
//   // onSuccess,
//   accessToken,
// }: AddTrainerModalProps) => {
//   const [showPassword, setShowPassword] = useState(false)
//   const [isSubmitting, setIsSubmitting] = useState(false)

//   const form = useForm<AddTrainerFormValues>({
//     resolver: zodResolver(addTrainerSchema),
//     defaultValues: {
//       fullName: '',
//       email: '',
//       phone: '',
//       password: '',
//       role: 'Trainer',
//     },
//   })

//   const onSubmit = async (values: AddTrainerFormValues) => {
//     try {
//       setIsSubmitting(true)
//       const res = await fetch(
//         `${process.env.NEXT_PUBLIC_BACKEND_URL}/admin/trainer`,
//         {
//           method: 'POST',
//           headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${accessToken}`,
//           },
//           body: JSON.stringify({
//             name: values.fullName,
//             email: values.email,
//             phone: values.phone,
//             password: values.password,
//             role: 'TRAINER',
//           }),
//         },
//       )

//       if (!res.ok) {
//         const err = await res.json()
//         throw new Error(err?.message || 'Failed to add trainer')
//       }

      

//       form.reset()
//       onClose()
//       toast.success('Trainer added successfully!')
//     } catch (error: unknown) {
//       console.error('Add trainer error:', error)
//       toast.error(
//         error instanceof Error ? error.message : 'Failed to add trainer',
//       )
//     } finally {
//       setIsSubmitting(false)
//     }
//   }

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="w-full max-w-[480px] rounded-[16px] p-6 bg-white border-none">
//         <DialogHeader className="relative">
//           <DialogTitle className="text-xl font-bold text-[#00253E]">
//             Add New Trainer
//           </DialogTitle>
//           <p className="text-sm text-gray-500 mt-1">
//             Want to delete this Revenue, remember if you delete this it not show
//             again in your dashboard.
//           </p>
//         </DialogHeader>

//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="space-y-4 mt-2"
//           >
//             {/* Full Name */}
//             <FormField
//               control={form.control}
//               name="fullName"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-sm font-medium text-gray-700">
//                     Full Name
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="Butlar Mane"
//                       className="h-[48px] border border-gray-300 rounded-[8px] focus:ring-primary placeholder:text-[#616161]"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Email */}
//             <FormField
//               control={form.control}
//               name="email"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-sm font-medium text-gray-700">
//                     Email Address
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="Butlar@email.com"
//                       className="h-[48px] border border-gray-300 rounded-[8px] focus:ring-primary placeholder:text-[#616161]"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Phone */}
//             <FormField
//               control={form.control}
//               name="phone"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-sm font-medium text-gray-700">
//                     Phone Number{' '}
//                     <span className="text-gray-400 font-normal">
//                       (Optional)
//                     </span>
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       placeholder="+997 9384u35803"
//                       className="h-[48px] border border-gray-300 rounded-[8px] focus:ring-primary placeholder:text-[#616161]"
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Password */}
//             <FormField
//               control={form.control}
//               name="password"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-sm font-medium text-gray-700">
//                     Password
//                   </FormLabel>
//                   <FormControl>
//                     <div className="relative">
//                       <Input
//                         type={showPassword ? 'text' : 'password'}
//                         placeholder="••••••••••"
//                         className="h-[48px] border border-gray-300 rounded-[8px] pr-10 focus:ring-primary placeholder:text-[#959494]"
//                         {...field}
//                       />
//                       <button
//                         type="button"
//                         onClick={() => setShowPassword(!showPassword)}
//                         className="absolute top-3.5 right-3 text-gray-400 hover:text-gray-600"
//                       >
//                         {showPassword ? (
//                           <Eye className="w-4 h-4" />
//                         ) : (
//                           <EyeOff className="w-4 h-4" />
//                         )}
//                       </button>
//                     </div>
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Role */}
//             <FormField
//               control={form.control}
//               name="role"
//               render={({ field }) => (
//                 <FormItem>
//                   <FormLabel className="text-sm font-medium text-gray-700">
//                     Role
//                   </FormLabel>
//                   <FormControl>
//                     <Input
//                       disabled
//                       className="h-[48px] border border-gray-300 rounded-[8px] bg-gray-50"
//                       readOnly
//                       {...field}
//                     />
//                   </FormControl>
//                   <FormMessage />
//                 </FormItem>
//               )}
//             />

//             {/* Buttons */}
//             <div className="flex items-center justify-between gap-3 pt-2">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={onClose}
//                 className="flex items-center gap-2 h-[48px] px-6 rounded-full border-gray-300"
//               >
//                 <X className="w-4 h-4 text-red-500" />
//                 Cancel
//               </Button>
//               <Button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="flex items-center gap-2 h-[48px] px-8 rounded-full bg-primary text-[#00253E] font-bold hover:bg-primary/90"
//               >
//                 {isSubmitting ? (
//                   <Loader2 className="w-4 h-4 animate-spin" />
//                 ) : (
//                   <Plus className="w-4 h-4" />
//                 )}
//                 {isSubmitting ? 'Adding...' : 'Add'}
//               </Button>
//             </div>
//           </form>
//         </Form>
//       </DialogContent>
//     </Dialog>
//   )
// }

// export default AddTrainerModal

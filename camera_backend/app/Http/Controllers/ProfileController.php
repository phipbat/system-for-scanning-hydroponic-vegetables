<?php
// ไฟล์สำหรับ ProfileController (จัดการข้อมูลส่วนตัวของผู้ใช้ รูปโปรไฟล์ และการเปลี่ยนรหัสผ่านจากหน้าเว็บ)

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rules\Password;

class ProfileController extends Controller
{
    /**
     * Display the user's profile form.
     */
    public function index()
    {
        return view('profile', [
            'user' => Auth::user(),
        ]);
    }

    /**
     * Update the user's profile information.
     */
    public function update(Request $request)
    {
        $user = Auth::user();

        $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'display_name' => ['nullable', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email,' . $user->id],
            'profile_image' => ['nullable', 'image', 'max:20480'], // Max 20MB
        ], [
            'name.required' => 'กรุณากรอกชื่อ-นามสกุล',
            'email.required' => 'กรุณากรอกอีเมล',
            'email.unique' => 'อีเมลนี้ถูกใช้งานไปแล้วโดยผู้ใช้อื่น',
            'profile_image.image' => 'ไฟล์ต้องเป็นรูปภาพเท่านั้น',
            'profile_image.max' => 'รูปภาพต้องมีขนาดไม่เกิน 20MB',
        ]);

        $data = $request->only('name', 'display_name', 'email');

        if ($request->hasFile('profile_image')) {
            // ลบรูปเก่าถ้ามี
            if ($user->profile_image) {
                Storage::disk('public')->delete($user->profile_image);
            }
            // อัปโหลดรูปใหม่
            $path = $request->file('profile_image')->store('profiles', 'public');
            $data['profile_image'] = $path;
        }

        $user->update($data);

        return back()->with('status', 'profile-updated')
                     ->with('message', 'อัปเดตข้อมูลส่วนตัวเรียบร้อยแล้ว');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => ['required', 'current_password'],
            'password' => ['required', 'confirmed', Password::defaults()],
        ], [
            'current_password.required' => 'กรุณากรอกรหัสผ่านปัจจุบัน',
            'current_password.current_password' => 'รหัสผ่านปัจจุบันไม่ถูกต้อง',
            'password.required' => 'กรุณากรอกรหัสผ่านใหม่',
            'password.confirmed' => 'รหัสผ่านใหม่และการยืนยันไม่ตรงกัน',
        ]);

        Auth::user()->update([
            'password' => Hash::make($request->password),
        ]);

        return back()->with('status', 'password-updated')
                     ->with('message', 'เปลี่ยนรหัสผ่านเรียบร้อยแล้ว');
    }

    /**
     * Delete the user's profile image.
     */
    public function deleteImage()
    {
        $user = Auth::user();

        if ($user->profile_image) {
            Storage::disk('public')->delete($user->profile_image);
            $user->update(['profile_image' => null]);
        }

        return back()->with('status', 'profile-image-deleted')
                     ->with('message', 'ลบรูปโปรไฟล์เรียบร้อยแล้ว');
    }
}

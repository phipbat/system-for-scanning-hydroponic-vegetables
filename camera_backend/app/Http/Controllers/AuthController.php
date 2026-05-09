<?php
// ไฟล์สำหรับ AuthController (จัดการระบบการยืนยันตัวตน ทั้งเว็บและ API)

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class AuthController extends Controller
{
    /**
     * แสดงหน้าฟอร์มเข้าสู่ระบบ (GET /login)
     */
    public function showLoginForm()
    {
        if (Auth::check()) {
            return redirect('/');
        }
        return view('login');
    }

    /**
     * POST /login
     */
    public function webLogin(Request $request)
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required'],
        ], [
            'email.required' => 'กรุณากรอกอีเมล',
            'email.email' => 'รูปแบบอีเมลไม่ถูกต้อง',
            'password.required' => 'กรุณากรอกรหัสผ่าน',
        ]);

        if (Auth::attempt($credentials, $request->boolean('remember'))) {
            $request->session()->regenerate();
            return redirect()->intended('/');
        }

        return back()->withErrors([
            'email' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
        ])->onlyInput('email');
    }

    /**
     * POST /logout
     */
    public function webLogout(Request $request)
    {
        Auth::logout();
        $request->session()->invalidate();
        $request->session()->regenerateToken();
        return redirect('/login');
    }

    /**
     * POST /api/auth/register
     */
    public function register(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:6|confirmed',
        ], [
            'name.required' => 'กรุณากรอกชื่อ-นามสกุล',
            'email.required' => 'กรุณากรอกอีเมล',
            'email.unique' => 'อีเมลนี้ถูกใช้งานไปแล้ว',
            'password.required' => 'กรุณากรอกรหัสผ่าน',
            'password.min' => 'รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร',
            'password.confirmed' => 'รหัสผ่านและการยืนยันรหัสผ่านไม่ตรงกัน',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::create([
            'name' => $request->name,
            'display_name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user',
        ]);

        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'สมัครสมาชิกสำเร็จ',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'display_name' => $user->display_name,
                'email' => $user->email,
                'role' => $user->role,
                'profile_image' => $user->profile_image,
                'profile_image_url' => $user->profile_image_url,
            ],
        ], 201);
    }

    /**
     * POST /api/auth/login
     */
    public function login(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
            'password' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
            ], 422);
        }

        $user = User::where('email', $request->email)->first();

        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json([
                'message' => 'อีเมลหรือรหัสผ่านไม่ถูกต้อง',
            ], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'message' => 'เข้าสู่ระบบสำเร็จ',
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'display_name' => $user->display_name,
                'email' => $user->email,
                'role' => $user->role,
                'profile_image' => $user->profile_image,
                'profile_image_url' => $user->profile_image_url,
            ],
        ]);
    }

    /**
     * POST /api/auth/forgot-password
     */
    public function forgotPassword(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'email' => 'required|email',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'message' => $validator->errors()->first(),
            ], 422);
        }

        // ปัจจุบันส่งค่าสำเร็จกลับไปก่อน (Mock) เมื่อตั้งค่า SMTP แล้วจึงจะส่งอีเมลจริงได้
        return response()->json([
            'message' => 'ระบบได้ทำการส่งลิงก์สำหรับเปลี่ยนรหัสผ่านไปที่อีเมลของคุณแล้ว',
        ]);
    }

    /**
     * POST /api/user/push-token
     * อัปเดตรหัสสำหรับส่งแจ้งเตือน (Expo Push Token)
     */
    public function updatePushToken(Request $request)
    {
        $request->validate([
            'push_token' => 'required|string',
        ]);

        $user = $request->user();
        $user->push_token = $request->push_token;
        $user->save();

        return response()->json([
            'message' => 'อัปเดตรหัสการแจ้งเตือนสำเร็จ',
        ]);
    }
}

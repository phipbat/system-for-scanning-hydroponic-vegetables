<!DOCTYPE html>
<html lang="th">
{{-- หน้าเข้าสู่ระบบ (Login) --}}
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>เข้าสู่ระบบ - PlantoEye</title>
    
    <link href="https://fonts.googleapis.com/css2?family=Roboto:wght@300;400;500;700&family=Kanit:wght@300;400;500;600&display=swap" rel="stylesheet">
    
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://unpkg.com/@phosphor-icons/web"></script>
    <link rel="stylesheet" href="{{ asset('css/auth.css') }}">
    
    <script>
        tailwind.config = {
            theme: {
                extend: {
                    colors: {
                        brand: {
                            50: '#f1f7f1',
                            100: '#dfecdf',
                            200: '#b4d1b4',
                            500: '#1F4E1C',
                            600: '#1a4218',
                            700: '#153513',
                            900: '#0d210c',
                        }
                    }
                }
            }
        }
    </script>
    <style>
        /* White & Green Hydroponic Theme Overlay */
        .bg-poly-light {
            background-color: #f1f7f1; /* Brand 50 Fallback */
            /* Using a beautiful crisp hydroponic greenhouse lettuce image for the background pattern */
            background-image: url('https://images.unsplash.com/photo-1530836369250-ef71a3f5e4bf?auto=format&fit=crop&q=80&w=1920');
            background-size: cover;
            background-position: center;
        }

        /* Gradient mask to mix the hydroponic image with PlantoEye light theme (Subtle white wash) */
        .bg-overlay-light {
            background: linear-gradient(135deg, rgba(255,255,255,0.75) 0%, rgba(241,247,241,0.88) 100%);
        }
    </style>
</head>
<body class="antialiased font-sans flex items-center justify-center min-h-screen relative bg-white overflow-hidden">
    {{-- คอนเทนเนอร์หลักของหน้า Login --}}


    <div class="relative z-10 w-full max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-center justify-center lg:gap-24 md:gap-16 gap-12">
        {{-- ฝั่งซ้าย: โลโก้และชื่อระบบ --}}
        
        <div class="w-full md:w-5/12 text-center md:text-right flex flex-col items-center md:items-end p-4 fade-up">
            
            <div class="flex items-center gap-3 mb-2 justify-center md:justify-end">
                <i class="ph-fill ph-plant text-brand-600 text-[2rem] md:text-[2.5rem] drop-shadow-sm"></i>
                <h1 class="text-[2rem] md:text-4xl font-bold tracking-wide text-brand-900 font-serif drop-shadow-sm">PlantoEye</h1>
            </div>
            
            <p class="text-[0.85rem] md:text-base font-medium tracking-[0.25em] text-brand-600/90 uppercase">Smart Agriculture System</p>
            <p class="text-xs font-semibold tracking-widest text-brand-500/50 mt-1.5 uppercase">v.1.0</p>
            
        </div>

        <div class="hidden md:block w-px h-[280px] bg-brand-500/20 fade-in delay-100"></div>
        <div class="md:hidden h-px w-3/4 max-w-[200px] bg-brand-500/20 fade-in flex-shrink-0"></div>

        {{-- ฝั่งขวา: แบบฟอร์มเข้าสู่ระบบ --}}
        <div class="w-full md:w-6/12 max-w-[420px] text-center flex flex-col items-center p-4 fade-up delay-200">
            
            <div class="mb-6 mt-2">
                <i class="ph ph-users text-[3rem] text-brand-700/80 drop-shadow-sm"></i>
            </div>

            <form action="/login" method="POST" class="w-full space-y-4">
                @csrf
                {{-- ช่องกรอกอีเมล/ชื่อผู้ใช้ --}}
                
                <div class="relative flex items-center group">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pr-3 text-brand-600/80 border-r border-brand-500/15 my-2 pointer-events-none group-focus-within:text-brand-700 transition-colors">
                        <i class="ph-bold ph-user text-[1.05rem]"></i>
                    </div>
                    <input type="email" id="email" name="email" value="{{ old('email') }}" required autofocus
                           class="poly-input w-full pl-14 pr-4 py-3 rounded-xl focus:outline-none font-medium text-[14px]"
                           placeholder="Username (Email)">
                </div>
                @error('email')
                    <div class="text-left mt-1"><p class="text-[12px] text-red-500 font-semibold">{{ $message }}</p></div>
                @enderror

                {{-- ช่องกรอกรหัสผ่าน --}}
                <div class="relative flex items-center group">
                    <div class="absolute inset-y-0 left-0 flex items-center pl-4 pr-3 text-brand-600/80 border-r border-brand-500/15 my-2 pointer-events-none group-focus-within:text-brand-700 transition-colors">
                        <i class="ph-bold ph-lock-key text-[1.05rem]"></i>
                    </div>
                    <input type="password" id="password" name="password" required
                           class="poly-input w-full pl-14 pr-12 py-3 rounded-xl focus:outline-none font-medium text-[14px]"
                           placeholder="Password">
                    <button type="button" id="toggle-password" tabindex="-1" class="absolute inset-y-0 right-0 flex items-center pr-4 text-brand-500/60 hover:text-brand-700 transition-colors">
                        <i id="toggle-password-icon" class="ph-bold ph-eye text-lg"></i>
                    </button>
                </div>

                <div class="flex items-center justify-between pt-1 pb-4 px-1">
                    
                    <label class="custom-checkbox flex items-center gap-2.5 cursor-pointer group">
                        <input type="checkbox" name="remember" class="peer sr-only">
                        <div class="w-[18px] h-[18px] rounded-[4px] border-[2px] border-brand-500/40 bg-white flex items-center justify-center transition-all group-hover:border-brand-500 relative">
                            <i class="ph-bold ph-check text-white text-[11px] opacity-0 transition-opacity absolute"></i>
                        </div>
                        <span class="text-[13px] font-semibold text-slate-500 group-hover:text-brand-900 transition-colors select-none">Remember me</span>
                    </label>

                    <a href="#" class="flex items-center gap-1.5 text-[13px] font-bold text-slate-500 hover:text-brand-700 transition-colors">
                        <i class="ph-bold ph-envelope-simple text-[16px]"></i>
                        Forget Password
                    </a>

                </div>

                <div class="pt-2">
                    <button type="submit" id="login-submit" class="poly-btn w-full py-3 rounded-xl text-white font-bold text-[14px] tracking-wide focus:outline-none focus:ring-4 focus:ring-brand-500/30 relative overflow-hidden flex items-center justify-center">
                        <span>LOGIN</span>
                    </button>
                </div>

            </form>
            
        </div>
        
    </div>

    <script>
        document.addEventListener('DOMContentLoaded', () => {
            const toggleBtn = document.getElementById('toggle-password');
            const passwordInput = document.getElementById('password');
            const toggleIcon = document.getElementById('toggle-password-icon');
            const form = document.querySelector('form');
            const submitBtn = document.getElementById('login-submit');

            if (toggleBtn && passwordInput && toggleIcon) {
                toggleBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    const isPassword = passwordInput.getAttribute('type') === 'password';
                    passwordInput.setAttribute('type', isPassword ? 'text' : 'password');
                    toggleIcon.className = isPassword ? 'ph-bold ph-eye-slash text-xl' : 'ph-bold ph-eye text-xl';
                });
            }

            if (form && submitBtn) {
                form.addEventListener('submit', () => {
                    submitBtn.disabled = true;
                    submitBtn.style.opacity = '0.9';
                    submitBtn.style.cursor = 'not-allowed';
                    submitBtn.innerHTML = '<i class="ph-bold ph-spinner-gap animate-spin text-xl"></i>&nbsp;<span>LOGGING IN...</span>';
                });
            }
        });
    </script>
</body>
</html>

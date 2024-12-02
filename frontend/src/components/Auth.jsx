import { useState } from "react";
import { LoaderIcon } from 'lucide-react';
import Cookies from 'universal-cookie';


const URL = 'http://localhost:3000/api/auth';

const cookies = new Cookies();

const initialState = {
    username: '',
    email: '',
    password: "",
    confirmPassword: '',
    rememberMe : false,
}

const initialErrors = {
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
}

// eslint-disable-next-line react/prop-types
const FloatingLabelInput = ({ type, name, label, onChange, value, error }) => {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <div className="relative">
            <input
                id={name}
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                onFocus={() => setIsFocused(true)}
                onBlur={() => setIsFocused(false)}
                className={`block input w-full text-xl text-login-text
                bg-input-bg border-1 appearance-none focus:outline-none focus:ring-0 
                peer ${error ? 'border-red-500' : ' focus:border-blue-600'}`}
                placeholder=" "
                // required={true}
            />
            <label
                htmlFor={name}
                className={`absolute text-xl duration-300 transform -translate-y-7 scale-75 top-1 z-10 origin-[0] px-2 
                peer-focus:px-2 peer-placeholder-shown:scale-100
                
                peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-8 left-1
                ${error ? 'text-red-500' : 'text-login-text  peer-placeholder-shown:-translate-y-1/2 '} 
                ${(isFocused || value) && !error ? 'peer-focus:text-blue-600' : ''}`}
            >
                {label}
            </label>
            {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
    );
};

// eslint-disable-next-line react/prop-types
const CheckBox = ({content, name, onChange, error}) => {
    return (
        <div className='flex flex-col gap-1'>
            <div className='flex gap-3 items-center'>
                <input
                    type="checkbox"
                    className={`checkbox ${error ? 'border-red-500' : 'bg-base-100'}`}
                    name={name}
                    id={name}
                    onChange={onChange}
                />
                <label className={"text-login-text text-xl hover:cursor-pointer"} htmlFor={name}>{content}</label>
            </div>
            {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </div>
    );
}

const Auth = () => {
    const authTextClass = 'text-login-text text-xl';
    const [isSignUp, setIsSignUp] = useState(false);
    const [form, setForm] = useState(initialState);
    const [errors, setErrors] = useState(initialErrors);
    const [termsAccepted, setTermsAccepted] = useState(false);
    const [submitError, setSubmitError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const validateField = (name, value) => {
        switch (name) {
            case 'username':
                if (isSignUp) {
                    if (!value) return 'Username is required';
                    if (value.length < 3) return 'Username must be at least 3 characters';
                } else if (!value) return 'Username is required';
                return '';
            case 'email':
                if (!value) return 'Email is required';
                if (!/\S+@\S+\.\S+/.test(value)) return 'Please enter a valid email';
                return '';
            case 'password':
                if (isSignUp) {
                    if (!value) return 'Password is required';
                    if (value.length < 6) return 'Password must be at least 6 characters';
                    if (!/(?=.*[0-9])/.test(value)) return 'Password must contain at least one number';
                } else if (!value) return 'Password is required';
                return '';
            case 'confirmPassword':
                if (!value) return 'Please confirm your password';
                if (value !== form.password) return 'Passwords do not match';
                return '';
            default:
                return '';
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm({ ...form, [name]: value });

        // Clear submit error when user starts typing
        if (submitError) setSubmitError('');

        // Validate field on change
        const error = validateField(name, value);
        setErrors(prev => ({ ...prev, [name]: error }));

        // Special handling for password changes
        if (name === 'password' && form.confirmPassword) {
            const confirmError = validateField('confirmPassword', form.confirmPassword);
            setErrors(prev => ({ ...prev, confirmPassword: confirmError }));
        }
    };

    const handleCheckboxChange = (e) => {
        const { name, checked } = e.target;
        if (name === 'agreedUseTerm') {
            setTermsAccepted(checked);
        } else if (name === 'rememberMe') {
            setForm({ ...form, [name]: checked });
        }
    };

    const validateForm = () => {
        const newErrors = {};
        Object.keys(form).forEach(key => {
            if (isSignUp || (key !== 'username' && key !== 'confirmPassword')) {
                const error = validateField(key, form[key]);
                if (error) newErrors[key] = error;
            }
        });

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0 && (!isSignUp || termsAccepted);
    };


    const setError = (statusCode, errorMessage) => {
        switch (statusCode) {
            case 400:
                if (errorMessage.includes('Email already in use')) {
                    setSubmitError('This email is already registered.');
                    setErrors(prev => ({ ...prev, email: ' ' }))
                }
                if (errorMessage.includes('Invalid credentials')) {
                    setSubmitError('Invalid email or password. Please try again.');
                    setErrors(prev => ({ ...prev, email: ' ', password: ' ' }))
                } break

            case 500:
                if (errorMessage.includes('Error logging in')) {
                    setSubmitError('Error logging in.');
                }
                if (errorMessage.includes('Invalid credentials')) {
                    setSubmitError('Error registering user.');
                } break
            default:

        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');

        if (!validateForm()) {
            setSubmitError('Please fix the errors before submitting');
            return;
        }
        setIsLoading(true);

        try {
            const endpoint = URL + (!isSignUp ? '/login' : '/register');
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(form),
            });

            const data = await response.json();

            if (!response.ok) {
                setError(response.status, data.error);
                return;
            }

            cookies.set('token', data.token);
            cookies.set('user', data.user);

            window.location.reload();

        } catch (error) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const switchMode = () => {
        setForm(initialState);
        setErrors(initialErrors);
        setSubmitError('');
        setIsSignUp(!isSignUp);
    };

    return (
        <div className="min-h-screen bg-nav-bg flex flex-row justify-center flex-wrap gap-x-[30%] pt-8 pb-5 gap-y-5">
            <div className={'w-[300px] h-[300px] rounded-[300px] bg-base-100'}>
            {/*    TODO: Logo or slogan or something*/}
            </div>
            <div className="p-10 w-[min(500px,_90%)] bg-content-bg rounded-2xl h-fit">
                <form onSubmit={handleSubmit} className='flex flex-col gap-10 justify-between'>
                    <h1 className='text-neutral-50 text-4xl'>{isSignUp ? "Getting Started" : "Welcome Back"}</h1>

                    {submitError && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
                            {submitError}
                        </div>
                    )}


                    {isSignUp && (
                        <FloatingLabelInput
                            onChange={handleChange}
                            type='text'
                            name='username'
                            label='Username'
                            value={form.username}
                            error={errors.username}
                        />
                    )}

                    <FloatingLabelInput
                        onChange={handleChange}
                        type='email'
                        name='email'
                        label='Email'
                        value={form.email}
                        error={errors.email}
                    />

                    <FloatingLabelInput
                        onChange={handleChange}
                        type='password'
                        name='password'
                        label='Password'
                        value={form.password}
                        error={errors.password}
                    />

                    {isSignUp && (
                        <FloatingLabelInput
                            onChange={handleChange}
                            type='password'
                            name='confirmPassword'
                            label='Password Confirmation'
                            value={form.confirmPassword}
                            error={errors.confirmPassword}
                        />
                    )}

                    {!isSignUp ? (
                        <div className="flex justify-between">
                            <CheckBox
                                name='rememberMe'
                                content='Remember me'
                                onChange={handleCheckboxChange}
                            />
                            <a href="#" className={authTextClass + ' hover:text-login-btn'}>
                                Forgot password?
                            </a>
                        </div>
                    ) : (
                        <CheckBox
                            name='agreedUseTerm'
                            content='I agree to the terms of use'
                            onChange={handleCheckboxChange}
                        />
                    )}

                    <button
                        type='submit'
                        className={' text-neutral-50 p-2.5 rounded-md hover:bg-opacity-90 transition-colors' +
                            `${!(!isSignUp || termsAccepted) ? ' bg-gray-700 ' : ' bg-login-btn'}`}
                        disabled={(!(!isSignUp || termsAccepted)) || isLoading}
                    >
                        {isLoading ? (
                            <LoaderIcon className="animate-spin" />
                        ) : (
                            isSignUp ? "Sign up" : "Login"
                        )}
                    </button>

                    <p className={authTextClass + ' text-center'}>
                        {isSignUp ? "Already have an account? " : "Don't have an account? "}
                        <span
                            onClick={switchMode}
                            className={authTextClass + ' underline text-neutral-50 cursor-pointer hover:text-login-btn'}
                        >
                            {isSignUp ? "Login" : "Sign up"}
                        </span>
                    </p>
                </form>
            </div>
        </div>
    );
};

export default Auth;
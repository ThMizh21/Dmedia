

import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY; 
const supabase = createClient(supabaseUrl, supabaseKey);

const form = document.getElementById('signUpForm');
form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    // Sign up using Supabase Auth
    const { user, error } = await supabase.auth.signUp({
        email,
        password,
    });

    if (error) {
        console.error('Error:', error);
        alert('Error signing up: ' + error.message);
    } else {
        console.log('User signed up:', user);
        alert('Sign up successful! Please check your email for confirmation.');
        form.reset(); // Reset the form
    }
});

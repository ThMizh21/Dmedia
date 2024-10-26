
// Initialize Supabase client
const supabaseUrl = 'https://hsfbozpccwrempcnmoru.supabase.co'; // Replace with your Supabase URL
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhzZmJvenBjY3dyZW1wY25tb3J1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mjk0NDIwMjUsImV4cCI6MjA0NTAxODAyNX0.VO_E1kxkME8E-wEnwbZmqQeYBiHsHhcJKBEJFJA2_CU'; // Replace with your API key
const supabase = supabase.createClient(supabaseUrl, supabaseKey);

const signupForm = document.getElementById('signup-form');

signupForm.addEventListener('submit', async (event) => {
    event.preventDefault(); // Prevent form from submitting the default way

    const email = signupForm.email.value;
    const password = signupForm.password.value;

    try {
        const { user, error } = await supabase.auth.signUp({ email, password });
        if (error) {
            console.error('Error signing up:', error);
            alert('Error signing up: ' + error.message);
        } else {
            alert('Sign-up successful! Please check your email for confirmation.');
            signupForm.reset(); // Reset the form fields
        }
    } catch (error) {
        console.error('Error:', error);
        alert('An unexpected error occurred. Please try again.');
    }
});

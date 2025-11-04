document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('inquiryForm');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        try {
            const response = await fetch('/backend/inquire', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(`Server error: ${result.message || 'Unknown error'}`);
            }

            const responseDiv = document.getElementById('response');
            responseDiv.style.display = 'block';
            responseDiv.innerHTML = `
        <h3>Thank you for your inquiry!</h3>
        <p>${result.match_analysis}</p>
    `;

            e.target.reset();
        } catch (error) {
            console.error('Error details:', error);
            alert(`Error submitting inquiry: ${error.message}`);
        }
    });
});
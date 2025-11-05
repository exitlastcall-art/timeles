// This function calls our Netlify serverless function, which then calls the Gemini API.
// The API key is handled securely on the server-side.
const callApiProxy = async (action: string, payload: any) => {
    try {
        const response = await fetch('/.netlify/functions/gemini', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ action, payload }),
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API call failed with status ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`Error calling proxy for action "${action}":`, error);
        throw error; // Re-throw to be handled by the calling function
    }
};

export const generateHeartfeltMessage = async (prompt: string): Promise<string> => {
  try {
    const data = await callApiProxy('generateMessage', { prompt });
    return data.text;
  } catch (error) {
    console.error("Error generating message:", error);
    // Provide a more specific fallback for the user
    return "There was an error generating the message. This may be due to a missing API key in the deployment configuration. Please try again.";
  }
};

export const generateCoverImage = async (message: string): Promise<string> => {
    try {
        const data = await callApiProxy('generateImage', { message });
        return data.imageUrl;
    } catch (error) {
        console.error("Error generating cover image:", error);
        // Fallback to a placeholder image
        return `https://picsum.photos/seed/${Date.now()}/512/512?grayscale`;
    }
};

export const generateWelcomeSong = async (): Promise<string | null> => {
    try {
        const data = await callApiProxy('generateSong', {});
        return data.base64Audio || null;
    } catch (error)
    {
        console.error("Error generating welcome song:", error);
        return null;
    }
};

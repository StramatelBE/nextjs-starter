// Shared API fetching functions with better error handling

// Generic fetch function with error handling, retries, and auth
async function fetchApi<T = any>(url: string, options?: RequestInit, retries = 2): Promise<T> {
    const fetchOptions: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        credentials: 'include',
    };

    try {
        const response = await fetch(url, fetchOptions);

        if (!response.ok) {
            if (response.status === 401) {
                // Redirect to login on auth failure
                window.location.href = '/login';
                throw new Error('Authentication required');
            }

            // Try to parse error data
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API error: ${response.status}`);
        }

        // Parse JSON response with error handling
        try {
            return await response.json();
        } catch (error : any) {
            console.error('Error parsing JSON response:', error);
            throw new Error('Invalid response format from server');
        }
    } catch (error : any) {
        // Implement retry logic for network errors
        if (retries > 0 && (error instanceof TypeError || error.message.includes('fetch'))) {
            console.warn(`Retrying API call to ${url}, ${retries} attempts left`);
            // Wait 1 second before retrying
            await new Promise(resolve => setTimeout(resolve, 1000));
            return fetchApi(url, options, retries - 1);
        }

        // Re-throw the error after retries are exhausted
        throw error;
    }
}

// Settings API
export async function fetchSettings() {
    try {
        return await fetchApi('/api/settings');
    } catch (error : any) {
        console.error('Error fetching settings:', error);
        return { success: false, error: error.message };
    }
}

export async function updateSettings(settingId: number, data: any) {
    try {
        return await fetchApi(`/api/settings/${settingId}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    } catch (error : any) {
        console.error('Error updating settings:', error);
        return { success: false, error: error.message };
    }
}

export async function updateDate(date: string) {
    try {
        return await fetchApi('/api/settings/date', {
            method: 'PUT',
            body: JSON.stringify({ date }),
        });
    } catch (error : any) {
        console.error('Error updating date:', error);
        return { success: false, error: error.message };
    }
}

// Playlist API
export async function fetchPlaylists() {
    try {
        return await fetchApi('/api/playlists');
    } catch (error : any) {
        console.error('Error fetching playlists:', error);
        return { success: false, error: error.message };
    }
}

export async function fetchPlaylistById(id: number) {
    try {
        return await fetchApi(`/api/playlists/${id}`);
    } catch (error : any) {
        console.error(`Error fetching playlist ${id}:`, error);
        return { success: false, error: error.message };
    }
}

export async function createPlaylist(name: string) {
    try {
        return await fetchApi('/api/playlists', {
            method: 'POST',
            body: JSON.stringify({ name }),
        });
    } catch (error : any) {
        console.error('Error creating playlist:', error);
        return { success: false, error: error.message };
    }
}

export async function updatePlaylist(id: number, name: string) {
    try {
        return await fetchApi(`/api/playlists/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ name }),
        });
    } catch (error : any) {
        console.error(`Error updating playlist ${id}:`, error);
        return { success: false, error: error.message };
    }
}

export async function deletePlaylist(id: number) {
    try {
        return await fetchApi(`/api/playlists/${id}`, {
            method: 'DELETE',
        });
    } catch (error : any) {
        console.error(`Error deleting playlist ${id}:`, error);
        return { success: false, error: error.message };
    }
}

export async function updateMediasInPlaylist(id: number, medias: any[]) {
    try {
        return await fetchApi(`/api/playlists/${id}/medias`, {
            method: 'PUT',
            body: JSON.stringify(medias),
        });
    } catch (error : any) {
        console.error(`Error updating medias in playlist ${id}:`, error);
        return { success: false, error: error.message };
    }
}

// Media API
export async function uploadMedia(file: File, playlistId: number) {
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('playlistId', playlistId.toString());

        // Use fetch directly for FormData
        const response = await fetch('/api/medias', {
            method: 'POST',
            body: formData,
            credentials: 'include',
        });

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to upload media: ${response.status}`);
        }

        return await response.json();
    } catch (error: any) {
        console.error('Error uploading media:', error);
        return { success: false, error: error.message };
    }
}

export async function deleteMedia(id: number) {
    try {
        return await fetchApi(`/api/medias/${id}`, {
            method: 'DELETE',
        });
    } catch (error : any) {
        console.error(`Error deleting media ${id}:`, error);
        return { success: false, error: error.message };
    }
}

export async function updateMedia(id: number, data: any) {
    try {
        return await fetchApi(`/api/medias/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    } catch (error : any) {
        console.error(`Error updating media ${id}:`, error);
        return { success: false, error: error.message };
    }
}

export async function addData(type: string, playlistId: number) {
    try {
        return await fetchApi('/api/medias/addData', {
            method: 'POST',
            body: JSON.stringify({ type, playlistId }),
        });
    } catch (error : any) {
        console.error('Error adding data to playlist:', error);
        return { success: false, error: error.message };
    }
}

// Mode API
export async function fetchMode() {
    try {
        return await fetchApi('/api/modes/1');
    } catch (error : any) {
        console.error('Error fetching mode:', error);
        return { success: false, error: error.message };
    }
}

export async function updateMode(name: string, playlistId: number | null) {
    try {
        return await fetchApi('/api/modes/1', {
            method: 'PUT',
            body: JSON.stringify({ name, playlist_id: playlistId }),
        });
    } catch (error : any) {
        console.error('Error updating mode:', error);
        return { success: false, error: error.message };
    }
}

// Data API
export async function fetchData() {
    try {
        return await fetchApi('/api/data');
    } catch (error : any) {
        console.error('Error fetching data:', error);
        return { success: false, error: error.message };
    }
}

export async function updateDataById(id: number, value: string) {
    try {
        return await fetchApi(`/api/data/${id}`, {
            method: 'PUT',
            body: JSON.stringify({ value }),
        });
    } catch (error : any) {
        console.error(`Error updating data ${id}:`, error);
        return { success: false, error: error.message };
    }
}

// Accident API
export async function fetchAccident() {
    try {
        return await fetchApi('/api/accidents');
    } catch (error : any) {
        console.error('Error fetching accidents:', error);
        return { success: false, error: error.message };
    }
}

export async function updateAccident(id: number, data: any) {
    try {
        return await fetchApi(`/api/accidents/${id}`, {
            method: 'PUT',
            body: JSON.stringify(data),
        });
    } catch (error : any) {
        console.error(`Error updating accident ${id}:`, error);
        return { success: false, error: error.message };
    }
}

// User API
export async function changePassword(oldPassword: string, newPassword: string) {
    try {
        return await fetchApi('/api/auth/change-password', {
            method: 'POST',
            body: JSON.stringify({ oldPassword, newPassword }),
        });
    } catch (error : any) {
        console.error('Error changing password:', error);
        return { success: false, error: error.message };
    }
}

// Config API
export async function fetchConfig() {
    try {
        return await fetchApi('/api/config');
    } catch (error : any) {
        console.error('Error fetching config:', error);
        return { success: false, error: error.message };
    }
}

export async function updateConfig(configData: any) {
    try {
        return await fetchApi('/api/config', {
            method: 'PUT',
            body: JSON.stringify(configData),
        });
    } catch (error : any) {
        console.error('Error updating config:', error);
        return { success: false, error: error.message };
    }
}
// Shared API fetching functions

// Generic fetch function with error handling and auth
async function fetchApi<T = any>(url: string, options?: RequestInit): Promise<T> {
    const fetchOptions: RequestInit = {
        ...options,
        headers: {
            'Content-Type': 'application/json',
            ...options?.headers,
        },
        credentials: 'include',
    };

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
        if (response.status === 401) {
            // Redirect to login on auth failure
            window.location.href = '/login';
        }

        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `API error: ${response.status}`);
    }

    return response.json();
}

// Settings API
export async function fetchSettings() {
    return fetchApi('/api/settings');
}

export async function updateSettings(settingId: number, data: any) {
    return fetchApi(`/api/settings/${settingId}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function updateDate(date: string) {
    return fetchApi('/api/settings/date', {
        method: 'PUT',
        body: JSON.stringify({ date }),
    });
}

// Playlist API
export async function fetchPlaylists() {
    return fetchApi('/api/playlists');
}

export async function fetchPlaylistById(id: number) {
    return fetchApi(`/api/playlists/${id}`);
}

export async function createPlaylist(name: string) {
    return fetchApi('/api/playlists', {
        method: 'POST',
        body: JSON.stringify({ name }),
    });
}

export async function updatePlaylist(id: number, name: string) {
    return fetchApi(`/api/playlists/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ name }),
    });
}

export async function deletePlaylist(id: number) {
    return fetchApi(`/api/playlists/${id}`, {
        method: 'DELETE',
    });
}

export async function updateMediasInPlaylist(id: number, medias: any[]) {
    return fetchApi(`/api/playlists/${id}/medias`, {
        method: 'PUT',
        body: JSON.stringify(medias),
    });
}

// Media API
export async function uploadMedia(file: File, playlistId: number) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('playlistId', playlistId.toString());

    return fetch('/api/medias', {
        method: 'POST',
        body: formData,
        credentials: 'include',
    }).then(response => {
        if (!response.ok) {
            throw new Error('Failed to upload media');
        }
        return response.json();
    });
}

export async function deleteMedia(id: number) {
    return fetchApi(`/api/medias/${id}`, {
        method: 'DELETE',
    });
}

export async function updateMedia(id: number, data: any) {
    return fetchApi(`/api/medias/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

export async function addData(type: string, playlistId: number) {
    return fetchApi('/api/medias/addData', {
        method: 'POST',
        body: JSON.stringify({ type, playlistId }),
    });
}

// Mode API
export async function fetchMode() {
    return fetchApi('/api/modes/1');
}

export async function updateMode(name: string, playlistId: number | null) {
    return fetchApi('/api/modes/1', {
        method: 'PUT',
        body: JSON.stringify({ name, playlist_id: playlistId }),
    });
}

// Data API
export async function fetchData() {
    return fetchApi('/api/data');
}

export async function updateDataById(id: number, value: string) {
    return fetchApi(`/api/data/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ value }),
    });
}

// Accident API
export async function fetchAccident() {
    return fetchApi('/api/accidents');
}

export async function updateAccident(id: number, data: any) {
    return fetchApi(`/api/accidents/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
    });
}

// User API
export async function changePassword(oldPassword: string, newPassword: string) {
    return fetchApi('/api/auth/change-password', {
        method: 'POST',
        body: JSON.stringify({ oldPassword, newPassword }),
    });
}
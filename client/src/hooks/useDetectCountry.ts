import { useEffect, } from 'react';
import { useDispatch } from 'react-redux';
import { API_CONFIG } from '../config/api.config';

export const useDetectCountry = (): void => {
    const dispatch = useDispatch();

    useEffect(() => {
        const isMounted = true;

        const detect = async () => {

            if (!isMounted) return;
            if(localStorage.getItem('country') != null) return;

            try {
                const response = await fetch(
                    `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.DETECT_COUNTRY}`,
                );
                if (response.ok) {
                    const data = await response.json();

                    if (data?.country) {
                        localStorage.setItem('country', JSON.stringify(data?.country));
                    } else {
                        localStorage.setItem('country', 'IN');
                    }
                } else {
                    localStorage.setItem('country', 'IN');
                }

            } catch (error) {
                console.error('Failed to Detect country on page load:', error);
            }
        };

        detect();
    }, [dispatch]);
    return;
};


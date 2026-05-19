import axios, { AxiosError, InternalAxiosRequestConfig } from "axios"

const baseURL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080/api/v1"

export const apiClient = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
})

// Request Interceptor (e.g., for logging or adding dynamic headers)
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // You could add logic here to inject headers if needed
    return config
  },
  (error) => Promise.reject(error)
)

// Response Interceptor (Global Error Handling)
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    const status = error.response?.status

    if (status === 401) {
      // Handle Unauthorized - maybe clear local state or redirect
      console.warn("Session expired or unauthorized")
    }

    if (status === 500) {
      console.error("Server Error: Please try again later.")
    }

    return Promise.reject(error)
  }
)

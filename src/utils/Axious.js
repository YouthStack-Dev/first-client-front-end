import axios from 'axios';

export const axiosBaseQuery = ({ baseUrl } = { baseUrl: '' }) =>
  
  async ({ url, method, data, params }) => {
    try {
      console.log("🔸 Axios Request →", {
        url: baseUrl + url,
        method,
        data,
        params,
      });

      const result = await axios({
        url: baseUrl + url,
        method,
        data,
        params,
        withCredentials: true,
      });

      console.log("✅ Axios Response →", result.data);

      return { data: result.data };
    } catch (error) {
      console.error("❌ Axios Error →", {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });

      return {
        error: {
          status: error.response?.status || 500,
          data: error.response?.data || error.message,
        },
      };
    }
  };

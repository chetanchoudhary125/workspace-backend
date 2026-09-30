import { useCallback, useEffect, useState } from "react";
import axiosInstance from "../API/axiosInstance";

export const useFetch = (url) => {
  const [data, setData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await axiosInstance.get(url);
      setData(res.data);
    } catch (err) {
      setError(err);
    } finally {
      setIsLoading(false);
    }
  }, [url]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refetch();
  }, [refetch]);

  return { data, isLoading, error, refetch };
};
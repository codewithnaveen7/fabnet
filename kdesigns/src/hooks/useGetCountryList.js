import { useState } from "react";
import useAxios from "./useAxios";
import { useToast } from "./useToast";

export function useGetCountryList() {
    const { fetchData,loading } = useAxios();
    const [countryList, setCountryList] = useState([]);
    const [error,setError]=useState("")
    const toast = useToast();
    const getHsMasterCountry = async (country= "US",hsVersion="2019Rev2.0",itemType="COUNTRY_LIST") => {
        setError("")
        const response = await fetchData({country,hsVersion,itemType}, "GET_HS_MASTER_HS");
        const { header = {}, itemList = [] } = response?.data || {};
        const { code, msg } = header;
        if (code === 200) setCountryList(itemList);
        else {
            setError(msg)
            toast.error("An error occurred while getting the country list. Please refresh the page.");
        }
        return response
    }
    return (
        { getHsMasterCountry,countryList,loading,error }
    )
}
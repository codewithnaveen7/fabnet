import { useCallback, useState } from 'react'


export const useRefreshTime=()=>{
    const [refreshTime,setRefreshTime]=useState(null)
    const [refreshStatus,setRefreshStatus]=useState(false)

    const onRefresh=useCallback(()=>{
        setRefreshStatus(c=>!c)
        
      },[])

      const onRefreshTime=useCallback(()=>{
        setRefreshTime(new Date().getTime());
      },[])

    return{
        setRefreshStatus:onRefresh,
        refreshStatus,
        setRefreshTime:onRefreshTime,
        refreshTime
    }
}



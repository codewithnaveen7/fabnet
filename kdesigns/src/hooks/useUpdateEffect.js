import { useEffect } from 'react'
import { useIsFirstRender } from './useIsFirstRender'


export const useUpdateEffect=(effect, deps)=>{
  const isFirst = useIsFirstRender()

  useEffect(() => {
    if (!isFirst) {
      return effect()
    }
  }, deps)
}



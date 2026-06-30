 const addExtraSpace=(params,trim=false)=>{
    if (typeof params === 'object' && !Array.isArray(params) && params !== null) {
        Object.keys(params).forEach((key) => {
            if(typeof params[key] === 'object')
                 addExtraSpace(params[key])
            else if(!trim)  (params[key] === "") ? params[key] = " " : params[key]
            else   (params[key] === " ") ? params[key]=params[key]?.trim() : params[key]
        })
    
    }
    return params
    
}

const showToast = (msg, duration = '3000') => {
    let toast = document.getElementsByClassName('kn-toast')
    if (toast[0]) {
        toast[0].innerHTML = msg;
        toast[0].style.display = 'block';
    }
    if (window.toastTimeOut) {
        clearTimeout(window.toastTimeOut)
    }
    window.toastTimeOut = setTimeout(() => {
        try {
            toast[0].innerHTML = "";
            toast[0].style.display = 'none'
        } catch (e) {
            console.log("Error:", msg)
        }
    }, duration)
}
export  { addExtraSpace, showToast }
export { default as BrowserCookies } from './BrowserCookies';
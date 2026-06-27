"use client"
import { usePathname, useRouter } from '@node_modules/next/navigation'
import { RefreshTokenForClient } from '@utils/utilFunctions'
import { ApiBase } from '@utils/variables'
import { useEffect } from 'react'

const TokenCheck = async () => {

    const response = await fetch(ApiBase + "/check_customer_token", {
        method : "GET",
        headers : {
            'Content-Type': 'application/json',
        },
        credentials: 'include',
    })
    return response
}


const CustomerRefreshTokenHandler = () => {

    const router = useRouter()
    const pathname = usePathname()
    
    useEffect(() => {
        

        TokenCheck().then(async (res) => {
            if(!res.ok){
                const response = await RefreshTokenForClient("/refresh_customer_token")
                if(response.ok){
                    router.refresh()
                }
            }
        })

    }, [router, pathname])

    
    return null
}

export default CustomerRefreshTokenHandler
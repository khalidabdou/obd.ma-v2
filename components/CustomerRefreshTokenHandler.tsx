"use client"
import { usePathname, useRouter } from '@node_modules/next/navigation'
import { RefreshTokenForClient } from '@utils/utilFunctions'
import { ApiBase } from '@utils/variables'
import { useEffect } from 'react'

const TokenCheck = async () => {
    const response = await fetch(ApiBase + "/check_customer_token", {
        method: "GET",
        headers: {
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
            if (res.ok) {
                // 200 = token valid OR guest user (authenticated:false)
                // No action needed in either case
                return
            }
            // 401 = token expired or invalid — try refresh
            if (res.status === 401) {
                const response = await RefreshTokenForClient("/refresh_customer_token")
                if (response.ok) {
                    router.refresh()
                }
            }
        }).catch(() => {
            // Network error — silently ignore
        })
    }, [router, pathname])

    return null
}

export default CustomerRefreshTokenHandler
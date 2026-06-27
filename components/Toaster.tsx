"use client"

import { CheckCircle, XCircle } from "lucide-react"
import React, { useState, createContext, useContext } from "react"

const ToasterContext = createContext({
    displayToaster: (label: string, toasterState?: "error" | "success") => {}
})

export const useToaster = () => {
    return useContext(ToasterContext)
}

const Toaster = ({ children }: { children: React.ReactNode }) => {
    const [showToaster, setShowToaster] = useState(false)
    const [transform, setTransform] = useState("translateY(0) translateX(-50%)")
    const [toasterLabel, setToasterLabel] = useState("")
    const [toasterState, setToasterState] = useState<"error" | "success">("success")
    const [timeoutIds, setTimeoutIds] = useState<{ showToasterTimeout: NodeJS.Timeout; transformToasterTimeout: NodeJS.Timeout } | null>(null)
    const holdTime = 2000

    const displayToaster = (label: string, toasterState?: "error" | "success") => {
        if (toasterState) {
            setToasterState(toasterState)
        }

        if (timeoutIds?.showToasterTimeout) {
            clearTimeout(timeoutIds?.showToasterTimeout)
        }
        if (timeoutIds?.transformToasterTimeout) {
            clearTimeout(timeoutIds?.transformToasterTimeout)
        }

        const transformToasterTimeout = setTimeout(() => {
            setTransform("translateX(-50%) translateY(-110%)")
        }, holdTime - 250)

        const showToasterTimeout = setTimeout(() => {
            setShowToaster(false)
        }, holdTime)

        setTimeoutIds((prev) => {
            return { ...prev, showToasterTimeout, transformToasterTimeout }
        })

        setTransform("translateY(0) translateX(-50%)")
        setToasterLabel(label)

        return setShowToaster(true)
    }

    return (
        <ToasterContext.Provider value={{ displayToaster }}>
            {showToaster && (
                <div
                    className="fixed left-1/2 top-5 z-[100] transition-transform duration-300"
                    style={{ transform }}
                >
                    <div className="flex items-center gap-2 rounded-lg bg-card p-3 shadow-lg border border-border">
                        {toasterState === "error" ? (
                            <XCircle className="h-5 w-5 text-red-500" />
                        ) : (
                            <CheckCircle className="h-5 w-5 text-green-500" />
                        )}
                        <span className="text-sm text-foreground">{toasterLabel}</span>
                    </div>
                </div>
            )}
            {children}
        </ToasterContext.Provider>
    )
}

export default Toaster

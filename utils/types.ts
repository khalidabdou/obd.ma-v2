
export type productType = {
    productCode: string
    images: {
        mainImage: string
        image1: string | null
        image2: string | null
    }
    title: string
    brandId: string
    price: number | null
    discountPercentage?: number | null
    discountedPrice?: number | null
    quantity: number | null
    description: string
    categoryId: string
    productContent: string[]
    choices: string[]
    creationDate: string
    [key: string]: any

}

export type carouselImageConfigType = {
    image: string | null
    carouselImage: string | null
    category: string | null
    productCode: string | null
    link: string | null
}

export type brandInfoType = {
    brandId: string
    brandImage: string
    brandName: string
}

export type categoryInfoType = {
    categoryId: string,
    categoryImage: string,
    categoryTitle: string
}

export type downloadableInfoType = {
    downloadableId: string
    downloadableImage: string
    titleOfDownloadable: string
    subtitle: string
    downloadableLink: string
}

export interface Props {
    searchParams: Promise<{ [key: string]: string | undefined }>;
}

export type cartItem = {
    productCode: string
    quantity: number
    choice: string | null
}

export type CartProductType = {
    productInfo: productType,
    quantity: number,
    choice: string | null
}

export type customerInfoType = {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    address: string
    city: string
}

export type customerAccountInfoType = {
    firstName: string
    lastName: string
    email: string
}

export type adminInfoType = {
    firstName: string,
    lastName: string,
    email: string,
    phoneNumber: string
}

export type PopupContextType = {
    displayPopUp: "carousel1" | "carousel2" | "brand" | "brandUpdate" | "categoryUpdate" | "category" | "downloadable" | "downloadableUpdate" | false;
    setDisplayPopUp: React.Dispatch<React.SetStateAction<"carousel1" | "carousel2" | "brandUpdate" | "brand" | "categoryUpdate" | "category" | "downloadable" | "downloadableUpdate" | false>>;
}

export type statusProgressType = "thanks" | "waiting" | "processed" | "shipping" | "delivered" | "cancelled"
export type canceledStatusType = boolean
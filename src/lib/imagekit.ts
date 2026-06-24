import ImageKit from "imagekit-javascript";

const imagekit = new ImageKit({
    publicKey: import.meta.env.VITE_IMAGEKIT_PUBLIC_KEY as string,
    urlEndpoint: import.meta.env.VITE_IMAGEKIT_URL_ENDPOINT as string,

});

export default imagekit;

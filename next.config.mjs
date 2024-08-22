/** @type {import('next').NextConfig} */
const nextConfig = {
    output: 'export',
    images: {
        unoptimized: true,
    },
    basePath: '/mapbox-task',  // Убедитесь, что это совпадает с названием вашего репозитория на GitHub
};

export default nextConfig;

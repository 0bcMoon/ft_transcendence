import endpoints from './endpoints.json';

// Type for the endpoints structure
type Endpoints = typeof endpoints;

// Helper function to get endpoint
export const getEndpoint = <T extends keyof Endpoints>(
    category: T,
    endpoint: keyof Endpoints[T]
): string => {
    return endpoints[category][endpoint] as string;
};

// Export the endpoints object for direct access if needed
export default endpoints; 
import PropertyVoiceAgent from "@/components/Common/PropertyVoiceAgent";


export default async function PropertyPage() {
    // const { slug } = params;

    const property = {
        "_id": "68ef74e09609eba87b8c07e9",
        "title": "Residential Farmhouse",
        "type": "residential",
        "category": "farmhouse",
        "description": "A prime farmhouse This property is semi furnished The building is new. It is part of a secure gated community. It has partial power backup.",
        "location": "mohali",
        "price": 190000,
        "built_up_area": 120,
        "carpet_area": 99,
        "unit_area_type": "sqft",
        "plot_front_area": 30,
        "plot_depth_area": 60,
        "plot_dimension_unit": "meter",
        "is_corner_plot": "yes",
        "bedrooms": 4,
        "bathrooms": 2,
        "balconies": 1,
        "floor_number": 5,
        "total_floors": 20,
        "washrooms": 0,
        "cabins": 0,
        "conference_rooms": 0,
        "facing": "north west",
        "overlooking": [],
        "property_age": "new",
        "transaction_type": "new",
        "gated_community": "no",
        "water_source": [
            "municipal supply"
        ],
        "power_backup": "partial",
        "furnishing": "furnished",
        "amenities": [
            "24x7 water supply",
            "cctv",
            "lift",
            "maintenance staff",
            "park",
            "rain water harvesting",
            "security",
            "visitor parking"
        ],
        "features": [
            "air conditioned",
            "balcony",
            "modular kitchen",
            "power backup"
        ],
        "images": [
            {
                "url": "1760524277690-images__3_.jfif",
                "alt": "images (3).jfif",
                "isPrimary": true,
                "_id": "68ef77f5854c53ee4e9e1fb1"
            },
            {
                "url": "1760424033730-Find-a-Real-Estate-Agent.jpeg",
                "alt": "Find-a-Real-Estate-Agent.jpeg",
                "isPrimary": false,
                "_id": "68ef77f5854c53ee4e9e1fb2"
            }
        ],
        "property_code": "PROP-1760523488066-BYL2W",
        "rera_status": "not approved",
        "owner_name": "test owner",
        "owner_contact": "0 1 2 3 4 5 6 7 8 9",
        "agencyId": "68c55d7c2df74062c8341bf7",
        "status": "Available",
        "createdAt": "2025-10-15T10:18:08.094Z",
        "updatedAt": "2025-10-15T10:31:17.834Z",
        "__v": 0
    };

    // Example user (replace with logged-in user later)
    const userId = "68c55d7b2df74062c8341bf5";

    return (
        <div className="p-6">
            <h1 className="text-3xl font-semibold mb-4">{property.title}</h1>
            <p className="text-gray-700">{property.description}</p>

            {/* Property Voice Agent */}
            <div className="mt-6">
                <PropertyVoiceAgent propertyId={property._id} userId={userId} />
            </div>
        </div>
    );
}

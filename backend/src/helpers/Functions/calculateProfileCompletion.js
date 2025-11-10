// Helper function to calculate profile completion
const calculateProfileCompletion = (profile, role) => {
    if (!profile) return 0;

    if (role === "candidate") {
        const sections = {
            basic: {
                fields: ["bio", "location", "dateOfBirth", "website"],
                weight: 15,
                required: ["bio", "location"],
            },
            photo: {
                fields: ["profilePhoto"],
                weight: 10,
                required: [],
            },
            experience: {
                fields: ["experience"],
                weight: 20,
                required: ["experience"],
            },
            education: {
                fields: ["education"],
                weight: 15,
                required: ["education"],
            },
            skills: {
                fields: ["skills"],
                weight: 15,
                required: ["skills"],
            },
            certifications: {
                fields: ["certifications"],
                weight: 10,
                required: [],
            },
            languages: {
                fields: ["languages"],
                weight: 5,
                required: [],
            },
            socialLinks: {
                fields: ["socialLinks"],
                weight: 10,
                required: [],
            },
        };

        let totalWeight = 0;
        let completedWeight = 0;

        for (const [section, config] of Object.entries(sections)) {
            // === Special case: languages
            if (section === "languages") {
                totalWeight += config.weight;
                const hasLanguages =
                    Array.isArray(profile.languages) && profile.languages.length > 0;
                if (hasLanguages) {
                    completedWeight += config.weight;
                }
                continue;
            }

            // === Special case: socialLinks
            if (section === "socialLinks") {
                totalWeight += config.weight;
                const value = profile.socialLinks;
                const hasLinks =
                    value &&
                    typeof value === "object" &&
                    Object.values(value).some(
                        (v) => typeof v === "string" && v.trim() !== ""
                    );
                if (hasLinks) {
                    completedWeight += config.weight;
                }
                continue;
            }

            // === Special case: photo
            if (section === "photo") {
                totalWeight += config.weight;
                const photo = profile.profilePhoto;
                const hasPhoto = typeof photo === "string" && photo.trim() !== "";
                if (hasPhoto) {
                    completedWeight += config.weight;
                }
                continue;
            }

            // === Special case: certifications
            if (section === "certifications") {
                totalWeight += config.weight;
                const hasCerts =
                    Array.isArray(profile.certifications) &&
                    profile.certifications.length > 0;
                if (hasCerts) {
                    completedWeight += config.weight;
                }
                continue;
            }

            // === Default behavior
            totalWeight += config.weight;

            const sectionCompleted =
                config.required.length === 0 ||
                config.required.every((field) => {
                    const value = profile[field];
                    if (
                        [
                            "experience",
                            "education",
                            "skills",
                            "certifications",
                            "languages",
                            "projects",
                        ].includes(field)
                    ) {
                        return Array.isArray(value) && value.length > 0;
                    } else {
                        return value && value.toString().trim();
                    }
                });

            const hasAnyField = config.fields.some((field) => {
                const value = profile[field];
                if (
                    [
                        "experience",
                        "education",
                        "skills",
                        "certifications",
                        "languages",
                        "projects",
                    ].includes(field)
                ) {
                    return Array.isArray(value) && value.length > 0;
                } else {
                    return value && value.toString().trim();
                }
            });

            if (sectionCompleted || hasAnyField) {
                completedWeight += config.weight;
            }
        }

        return Math.round((completedWeight / totalWeight) * 100);
    }

    // === For company role
    if (role === "company") {
        const fields = [
            "companyName",
            "description",
            "industry",
            "headquarter",
            "website",
            "companySize",
        ];

        let completed = 0;
        const total = fields.length;

        fields.forEach((field) => {
            const value = profile[field];
            if (value && value.toString().trim()) {
                completed++;
            }
        });

        return Math.round((completed / total) * 100);
    }

    return 0;
};

module.exports = calculateProfileCompletion;
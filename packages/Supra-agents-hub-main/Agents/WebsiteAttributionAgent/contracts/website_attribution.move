module website_attribution::attribution {
    use std::string::{Self, String};
    use std::signer;
    use std::table::{Self, Table};
    use std::vector;
    use aptos_framework::timestamp;
    use aptos_framework::coin;
    use aptos_framework::account;

    /// Error codes
    const E_WEBSITE_NOT_FOUND: u64 = 1;
    const E_WEBSITE_ALREADY_EXISTS: u64 = 2;
    const E_NOT_WEBSITE_OWNER: u64 = 3;
    const E_WEBSITE_NOT_VERIFIED: u64 = 4;
    const E_INVALID_CONVERSION_AMOUNT: u64 = 5;

    /// Website registration structure
    struct WebsiteRegistration has key, store {
        website_id: String,
        domain: String,
        owner: address,
        verification_token: String,
        is_verified: bool,
        registration_timestamp: u64,
        total_conversions: u64,
        total_earnings: u64,
    }

    /// Conversion event structure
    struct ConversionEvent has key, store {
        website_id: String,
        conversion_id: String,
        timestamp: u64,
        amount: u64, // Amount in smallest unit (e.g., micro-USD)
        source_url: String,
        destination_url: String,
    }

    /// Global storage for all website registrations
    struct WebsiteRegistry has key {
        websites: Table<String, WebsiteRegistration>,
        conversions: vector<ConversionEvent>,
        total_payouts: u64,
    }

    /// Initialize the module
    fun init_module(admin: &signer) {
        move_to(admin, WebsiteRegistry {
            websites: table::new(),
            conversions: vector::empty(),
            total_payouts: 0,
        });
    }

    /// Register a new website for attribution tracking
    public entry fun register_website(
        owner: &signer,
        website_id: String,
        domain: String,
        verification_token: String,
        registration_timestamp: u64
    ) acquires WebsiteRegistry {
        let owner_addr = signer::address_of(owner);
        let registry = borrow_global_mut<WebsiteRegistry>(@website_attribution);
        
        // Check if website already exists
        assert!(!table::contains(&registry.websites, website_id), E_WEBSITE_ALREADY_EXISTS);
        
        let registration = WebsiteRegistration {
            website_id: website_id,
            domain: domain,
            owner: owner_addr,
            verification_token: verification_token,
            is_verified: false,
            registration_timestamp: registration_timestamp,
            total_conversions: 0,
            total_earnings: 0,
        };
        
        table::add(&mut registry.websites, website_id, registration);
    }

    /// Verify website ownership
    public entry fun verify_website(
        admin: &signer,
        website_id: String
    ) acquires WebsiteRegistry {
        // Only admin can verify websites (after off-chain verification)
        assert!(signer::address_of(admin) == @website_attribution, E_NOT_WEBSITE_OWNER);
        
        let registry = borrow_global_mut<WebsiteRegistry>(@website_attribution);
        assert!(table::contains(&registry.websites, website_id), E_WEBSITE_NOT_FOUND);
        
        let website = table::borrow_mut(&mut registry.websites, website_id);
        website.is_verified = true;
    }

    /// Track a conversion event
    public entry fun track_conversion(
        tracker: &signer,
        website_id: String,
        conversion_id: String,
        amount: u64,
        source_url: String,
        timestamp: u64
    ) acquires WebsiteRegistry {
        let registry = borrow_global_mut<WebsiteRegistry>(@website_attribution);
        
        // Verify website exists and is verified
        assert!(table::contains(&registry.websites, website_id), E_WEBSITE_NOT_FOUND);
        let website = table::borrow_mut(&mut registry.websites, website_id);
        assert!(website.is_verified, E_WEBSITE_NOT_VERIFIED);
        assert!(amount > 0, E_INVALID_CONVERSION_AMOUNT);
        
        // Create conversion event
        let conversion = ConversionEvent {
            website_id: website_id,
            conversion_id: conversion_id,
            timestamp: timestamp,
            amount: amount,
            source_url: source_url,
            destination_url: string::utf8(b""), // Will be filled by order ID
        };
        
        // Update website stats
        website.total_conversions = website.total_conversions + 1;
        website.total_earnings = website.total_earnings + amount;
        
        // Store conversion event
        vector::push_back(&mut registry.conversions, conversion);
        registry.total_payouts = registry.total_payouts + amount;
    }

    /// Get website information
    #[view]
    public fun get_website_info(website_id: String): (String, address, bool, u64, u64, u64) acquires WebsiteRegistry {
        let registry = borrow_global<WebsiteRegistry>(@website_attribution);
        assert!(table::contains(&registry.websites, website_id), E_WEBSITE_NOT_FOUND);
        
        let website = table::borrow(&registry.websites, website_id);
        (
            website.domain,
            website.owner,
            website.is_verified,
            website.registration_timestamp,
            website.total_conversions,
            website.total_earnings
        )
    }

    /// Get total conversion count for a website
    #[view]
    public fun get_conversion_count(website_id: String): u64 acquires WebsiteRegistry {
        let registry = borrow_global<WebsiteRegistry>(@website_attribution);
        assert!(table::contains(&registry.websites, website_id), E_WEBSITE_NOT_FOUND);
        
        let website = table::borrow(&registry.websites, website_id);
        website.total_conversions
    }

    /// Get total earnings for a website
    #[view]
    public fun get_total_earnings(website_id: String): u64 acquires WebsiteRegistry {
        let registry = borrow_global<WebsiteRegistry>(@website_attribution);
        assert!(table::contains(&registry.websites, website_id), E_WEBSITE_NOT_FOUND);
        
        let website = table::borrow(&registry.websites, website_id);
        website.total_earnings
    }

    /// Get global statistics
    #[view]
    public fun get_global_stats(): (u64, u64) acquires WebsiteRegistry {
        let registry = borrow_global<WebsiteRegistry>(@website_attribution);
        (
            vector::length(&registry.conversions),
            registry.total_payouts
        )
    }

    /// Admin function to update payout amount for dynamic pricing
    public entry fun update_payout_rate(
        admin: &signer,
        website_id: String,
        new_rate: u64
    ) acquires WebsiteRegistry {
        assert!(signer::address_of(admin) == @website_attribution, E_NOT_WEBSITE_OWNER);
        // Implementation for dynamic pricing based on semantic similarity
        // This would integrate with AI models for content analysis
    }
} 
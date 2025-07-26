module umi_name_service::name_service {
    use std::signer;
    use std::string::{Self, String};
    use std::vector;
    use aptos_framework::account;
    use aptos_framework::timestamp;

    // Error codes
    const ENAME_ALREADY_REGISTERED: u64 = 1;
    const ENAME_NOT_REGISTERED: u64 = 2;
    const ENAME_INVALID: u64 = 3;
    const ENOT_OWNER: u64 = 4;
    const ENAME_TOO_SHORT: u64 = 5;
    const ENAME_TOO_LONG: u64 = 6;

    // Struct to store domain information
    struct DomainInfo has store, drop {
        owner: address,
        expiry: u64,
        resolver: address,
    }

    // Struct to store user's domains
    struct UserDomains has key {
        domains: vector<String>,
    }

    // Global storage for all domains
    struct DomainRegistry has key {
        domains: std::table::Table<String, DomainInfo>,
        total_domains: u64,
    }

    // Capability for managing the registry
    struct RegistryCapability has key {
        cap: u8, // kaldırıldı, dummy field
    }

    // Initialize the module
    fun init_module(account: &signer) {
        // Create the domain registry
        move_to(account, DomainRegistry {
            domains: std::table::new(),
            total_domains: 0,
        });

        // Store the capability (dummy, eski fonksiyon kaldırıldı)
        move_to(account, RegistryCapability {
            cap: 0,
        });
    }

    // Register a new domain
    public entry fun register_domain(
        user: &signer,
        name: String,
        duration_years: u64,
    ) acquires DomainRegistry, UserDomains {
        let user_addr = signer::address_of(user);
        
        // Validate domain name
        assert!(validate_domain_name(&name), ENAME_INVALID);
        assert!(string::length(&name) >= 3, ENAME_TOO_SHORT);
        assert!(string::length(&name) <= 63, ENAME_TOO_LONG);
        
        // Check if domain is already registered
        assert!(!is_domain_registered(&name), ENAME_ALREADY_REGISTERED);
        
        // Calculate expiry time (duration in years)
        let current_time = timestamp::now_seconds();
        let expiry = current_time + (duration_years * 365 * 24 * 60 * 60);
        
        // Create domain info
        let domain_info = DomainInfo {
            owner: user_addr,
            expiry,
            resolver: user_addr, // Default resolver is the owner
        };
        
        // Add to registry
        let registry = borrow_global_mut<DomainRegistry>(@umi_name_service);
        std::table::add(&mut registry.domains, name, domain_info);
        registry.total_domains = registry.total_domains + 1;
        
        // Add to user's domains
        if (!exists<UserDomains>(user_addr)) {
            move_to(user, UserDomains {
                domains: vector::empty(),
            });
        };
        
        let user_domains = borrow_global_mut<UserDomains>(user_addr);
        vector::push_back(&mut user_domains.domains, name);
    }

    // Check if a domain is registered
    public fun is_domain_registered(name: &String): bool acquires DomainRegistry {
        let registry = borrow_global<DomainRegistry>(@umi_name_service);
        std::table::contains(&registry.domains, *name)
    }

    // Get domain owner
    public fun get_domain_owner(name: &String): address acquires DomainRegistry {
        let registry = borrow_global<DomainRegistry>(@umi_name_service);
        assert!(std::table::contains(&registry.domains, *name), ENAME_NOT_REGISTERED);
        let domain_info = std::table::borrow(&registry.domains, *name);
        domain_info.owner
    }

    // Get domain expiry
    public fun get_domain_expiry(name: &String): u64 acquires DomainRegistry {
        let registry = borrow_global<DomainRegistry>(@umi_name_service);
        assert!(std::table::contains(&registry.domains, *name), ENAME_NOT_REGISTERED);
        let domain_info = std::table::borrow(&registry.domains, *name);
        domain_info.expiry
    }

    // Get user's domains
    public fun get_user_domains(user_addr: address): vector<String> acquires UserDomains {
        if (exists<UserDomains>(user_addr)) {
            let user_domains = borrow_global<UserDomains>(user_addr);
            *&user_domains.domains
        } else {
            vector::empty()
        }
    }

    // Transfer domain ownership
    public entry fun transfer_domain(
        user: &signer,
        name: String,
        new_owner: address,
    ) acquires DomainRegistry, UserDomains {
        let user_addr = signer::address_of(user);
        
        // Check if domain exists and user owns it
        assert!(is_domain_registered(&name), ENAME_NOT_REGISTERED);
        assert!(get_domain_owner(&name) == user_addr, ENOT_OWNER);
        
        // Update domain owner
        let registry = borrow_global_mut<DomainRegistry>(@umi_name_service);
        let domain_info = std::table::borrow_mut(&mut registry.domains, name);
        domain_info.owner = new_owner;
        
        // Remove from current user's domains
        let user_domains = borrow_global_mut<UserDomains>(user_addr);
        let i = 0;
        let len = vector::length(&user_domains.domains);
        while (i < len) {
            if (vector::borrow(&user_domains.domains, i) == &name) {
                vector::remove(&mut user_domains.domains, i);
                break
            };
            i = i + 1;
        };
        
        // Add to new user's domains
        if (!exists<UserDomains>(new_owner)) {
            move_to(user, UserDomains {
                domains: vector::empty(),
            });
        };
        
        let new_user_domains = borrow_global_mut<UserDomains>(new_owner);
        vector::push_back(&mut new_user_domains.domains, name);
    }

    // Set resolver for a domain
    public entry fun set_resolver(
        user: &signer,
        name: String,
        resolver: address,
    ) acquires DomainRegistry {
        let user_addr = signer::address_of(user);
        
        // Check if domain exists and user owns it
        assert!(is_domain_registered(&name), ENAME_NOT_REGISTERED);
        assert!(get_domain_owner(&name) == user_addr, ENOT_OWNER);
        
        // Update resolver
        let registry = borrow_global_mut<DomainRegistry>(@umi_name_service);
        let domain_info = std::table::borrow_mut(&mut registry.domains, name);
        domain_info.resolver = resolver;
    }

    // Renew domain
    public entry fun renew_domain(
        user: &signer,
        name: String,
        duration_years: u64,
    ) acquires DomainRegistry {
        let user_addr = signer::address_of(user);
        
        // Check if domain exists and user owns it
        assert!(is_domain_registered(&name), ENAME_NOT_REGISTERED);
        assert!(get_domain_owner(&name) == user_addr, ENOT_OWNER);
        
        // Update expiry
        let registry = borrow_global_mut<DomainRegistry>(@umi_name_service);
        let domain_info = std::table::borrow_mut(&mut registry.domains, name);
        let current_expiry = domain_info.expiry;
        let current_time = timestamp::now_seconds();
        
        // If domain is expired, renew from current time, otherwise extend from current expiry
        let new_expiry = if (current_expiry < current_time) {
            current_time + (duration_years * 365 * 24 * 60 * 60)
        } else {
            current_expiry + (duration_years * 365 * 24 * 60 * 60)
        };
        
        domain_info.expiry = new_expiry;
    }

    // Helper function to validate domain name
    fun validate_domain_name(name: &String): bool {
        let chars = string::bytes(name);
        let i = 0;
        let len = vector::length(chars);
        
        // Check if name is not empty
        if (len == 0) return false;
        
        // Check if starts or ends with hyphen
        if (*vector::borrow(chars, 0) == 45 || *vector::borrow(chars, len - 1) == 45) {
            return false
        };
        
        while (i < len) {
            let char = *vector::borrow(chars, i);
            // Allow lowercase letters (97-122), numbers (48-57), and hyphens (45)
            if (!(char >= 97 && char <= 122) && !(char >= 48 && char <= 57) && char != 45) {
                return false
            };
            i = i + 1;
        };
        
        true
    }

    // Get total number of domains
    public fun get_total_domains(): u64 acquires DomainRegistry {
        let registry = borrow_global<DomainRegistry>(@umi_name_service);
        registry.total_domains
    }

    // Check if domain is expired
    public fun is_domain_expired(name: &String): bool acquires DomainRegistry {
        let expiry = get_domain_expiry(name);
        let current_time = timestamp::now_seconds();
        expiry < current_time
    }
} 
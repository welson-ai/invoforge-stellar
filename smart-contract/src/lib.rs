#![no_std]
use soroban_sdk::{contract, contractimpl, contracterror, contracttype, Address, Env, String, Vec, Map, Symbol, symbol_short};

#[contract]
pub struct InvoforgeContract;

#[contracttype]
#[derive(Clone)]
pub struct Project {
    pub asset_code: String,
    pub creator: Address,
    pub current_owner: Address,
    pub github_url: String,
    pub version: String,
    pub license_type: String,
    pub royalty_percentage: u32,
    pub created_at: u64,
    pub metadata: String,
}

#[contracttype]
#[derive(Clone)]
pub struct License {
    pub project_id: u32,
    pub licensee: Address,
    pub license_type: String,
    pub terms: String,
    pub expires_at: u64,
    pub is_active: bool,
    pub granted_at: u64,
}

#[contracttype]
#[derive(Clone)]
pub struct RoyaltyPayment {
    pub project_id: u32,
    pub from_address: Address,
    pub amount: i128,
    pub payment_type: String,
    pub timestamp: u64,
}

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    AlreadyInitialized = 1,
    NotAuthorized = 2,
    ProjectNotFound = 3,
    InvalidInput = 4,
    LicenseExpired = 5,
    InsufficientBalance = 6,
    TransferRestricted = 7,
}

const ADMIN: Symbol = symbol_short!("ADMIN");
const PROJECTS: Symbol = symbol_short!("PROJS");
const LICENSES: Symbol = symbol_short!("LICENS");
const ROYALTIES: Symbol = symbol_short!("ROYALS");
const COUNTER: Symbol = symbol_short!("COUNTER");

#[contractimpl]
impl InvoforgeContract {
    pub fn initialize(env: Env, admin: Address) -> Result<(), Error> {
        if env.storage().instance().has(&ADMIN) {
            return Err(Error::AlreadyInitialized);
        }
        env.storage().instance().set(&ADMIN, &admin);
        env.storage().instance().set(&COUNTER, &0u32);
        Ok(())
    }

    pub fn register_project(
        env: Env,
        asset_code: String,
        creator: Address,
        github_url: String,
        license_type: String,
        royalty_percentage: u32,
        metadata: String,
    ) -> Result<u32, Error> {
        if royalty_percentage > 100 {
            return Err(Error::InvalidInput);
        }

        let counter: u32 = env.storage().instance().get(&COUNTER).unwrap_or(0);

        let project = Project {
            asset_code,
            creator: creator.clone(),
            current_owner: creator.clone(),
            github_url,
            version: String::from_str(&env, "1.0.0"),
            license_type,
            royalty_percentage,
            created_at: env.ledger().timestamp(),
            metadata,
        };

        let mut projects: Map<u32, Project> = env.storage().instance()
            .get(&PROJECTS).unwrap_or(Map::new(&env));
        projects.set(counter, project);
        env.storage().instance().set(&PROJECTS, &projects);
        env.storage().instance().set(&COUNTER, &(counter + 1));

        Ok(counter)
    }

    pub fn transfer_ownership(
        env: Env,
        project_id: u32,
        from: Address,
        to: Address,
    ) -> Result<(), Error> {
        let mut projects: Map<u32, Project> = env.storage().instance()
            .get(&PROJECTS).ok_or(Error::ProjectNotFound)?;

        let mut project = projects.get(project_id).ok_or(Error::ProjectNotFound)?;

        if project.current_owner != from {
            return Err(Error::NotAuthorized);
        }

        project.current_owner = to;
        projects.set(project_id, project);
        env.storage().instance().set(&PROJECTS, &projects);

        Ok(())
    }

    pub fn update_project(
        env: Env,
        project_id: u32,
        updater: Address,
        new_version: Option<String>,
        new_metadata: Option<String>,
    ) -> Result<(), Error> {
        let mut projects: Map<u32, Project> = env.storage().instance()
            .get(&PROJECTS).ok_or(Error::ProjectNotFound)?;

        let mut project = projects.get(project_id).ok_or(Error::ProjectNotFound)?;

        if project.creator != updater && project.current_owner != updater {
            return Err(Error::NotAuthorized);
        }

        if let Some(version) = new_version {
            project.version = version;
        }
        if let Some(metadata) = new_metadata {
            project.metadata = metadata;
        }

        projects.set(project_id, project);
        env.storage().instance().set(&PROJECTS, &projects);

        Ok(())
    }

    pub fn grant_license(
        env: Env,
        project_id: u32,
        licensor: Address,
        licensee: Address,
        license_type: String,
        terms: String,
        expires_at: u64,
    ) -> Result<(), Error> {
        let projects: Map<u32, Project> = env.storage().instance()
            .get(&PROJECTS).ok_or(Error::ProjectNotFound)?;

        let project = projects.get(project_id).ok_or(Error::ProjectNotFound)?;

        if project.current_owner != licensor {
            return Err(Error::NotAuthorized);
        }

        let license = License {
            project_id,
            licensee,
            license_type,
            terms,
            expires_at,
            is_active: true,
            granted_at: env.ledger().timestamp(),
        };

        let mut licenses: Map<u32, Vec<License>> = env.storage().instance()
            .get(&LICENSES).unwrap_or(Map::new(&env));

        let mut project_licenses = licenses.get(project_id).unwrap_or(Vec::new(&env));
        project_licenses.push_back(license);
        licenses.set(project_id, project_licenses);
        env.storage().instance().set(&LICENSES, &licenses);

        Ok(())
    }

    pub fn record_royalty(
        env: Env,
        project_id: u32,
        from_address: Address,
        amount: i128,
        payment_type: String,
    ) -> Result<(), Error> {
        let projects: Map<u32, Project> = env.storage().instance()
            .get(&PROJECTS).ok_or(Error::ProjectNotFound)?;

        projects.get(project_id).ok_or(Error::ProjectNotFound)?;

        let payment = RoyaltyPayment {
            project_id,
            from_address,
            amount,
            payment_type,
            timestamp: env.ledger().timestamp(),
        };

        let mut royalties: Map<u32, Vec<RoyaltyPayment>> = env.storage().instance()
            .get(&ROYALTIES).unwrap_or(Map::new(&env));

        let mut project_royalties = royalties.get(project_id).unwrap_or(Vec::new(&env));
        project_royalties.push_back(payment);
        royalties.set(project_id, project_royalties);
        env.storage().instance().set(&ROYALTIES, &royalties);

        Ok(())
    }

    pub fn get_project(env: Env, project_id: u32) -> Result<Project, Error> {
        let projects: Map<u32, Project> = env.storage().instance()
            .get(&PROJECTS).ok_or(Error::ProjectNotFound)?;
        projects.get(project_id).ok_or(Error::ProjectNotFound)
    }

    pub fn get_licenses(env: Env, project_id: u32) -> Result<Vec<License>, Error> {
        let licenses: Map<u32, Vec<License>> = env.storage().instance()
            .get(&LICENSES).ok_or(Error::ProjectNotFound)?;
        licenses.get(project_id).ok_or(Error::ProjectNotFound)
    }

    pub fn get_royalties(env: Env, project_id: u32) -> Result<Vec<RoyaltyPayment>, Error> {
        let royalties: Map<u32, Vec<RoyaltyPayment>> = env.storage().instance()
            .get(&ROYALTIES).ok_or(Error::ProjectNotFound)?;
        royalties.get(project_id).ok_or(Error::ProjectNotFound)
    }

    pub fn validate_license(env: Env, project_id: u32, licensee: Address) -> Result<bool, Error> {
        let licenses: Map<u32, Vec<License>> = env.storage().instance()
            .get(&LICENSES).ok_or(Error::ProjectNotFound)?;

        let project_licenses = licenses.get(project_id).ok_or(Error::ProjectNotFound)?;
        let current_time = env.ledger().timestamp();

        for license in project_licenses.iter() {
            if license.licensee == licensee && license.is_active {
                if license.expires_at == 0 || license.expires_at > current_time {
                    return Ok(true);
                }
            }
        }

        Ok(false)
    }

    pub fn get_transaction_count(env: Env) -> u32 {
        env.storage().instance().get(&COUNTER).unwrap_or(0)
    }
}
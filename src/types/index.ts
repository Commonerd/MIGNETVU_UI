export type Task = {
  id: number
  title: string
  created_at: Date
  updated_at: Date
}

export interface LoginResponse {
  name: string
  email: string
  token: string // 필요한 다른 필드가 있으면 추가하세요.
}

type MigrationTrace = {
  id: number
  network_id: number
  latitude: number
  longitude: number
  migration_year: number
  location_name: string
  reason: string
}

export type Network = {
  id: number
  user_id: number
  user_name: string
  title: string
  type: string
  nationality: string
  ethnicity: string
  migration_year: number
  end_year: number
  latitude: number
  longitude: number
  created_at: Date
  updated_at: Date
  connections: Array<{
    targetId: number
    targetType: string
    strength: number
    type: string
    year: number
  }>
  migration_traces: MigrationTrace[]
  photo: File
  photoUrl: string
}

export type CsrfToken = {
  csrf_token: string
}
export type Credential = {
  email: string
  password: string
  name: string
}

// new

export interface Migrant {
  id: number
  name: string
  nationality: string
  ethnicity: string
  latitude: number
  longitude: number
  migrationYear: number
  connections: Connection[]
  age: number
  occupation: string
  education: string
  languagesSpoken: string[]
  registrantId: number
}

export interface Organization {
  id: number
  name: string
  latitude: number
  longitude: number
  foundationYear: number
  connections: Connection[]
  type: string
  mission: string
  services: string[]
  contactInfo: string
  registrantId: number
}

export interface Connection {
  targetId: number
  targetType: "migrant" | "organization"
  strength: number // 1 to 5
  type: "friend" | "colleague" | "family" | "professional" | "cultural"
}
export type EntityType = "migrant" | "organization"

export type FilterOptions = {
  userNetworkConnectionFilter: any
  userNetworkTraceFilter: any
  userNetworkFilter: any
  networkIds: any
  nationality: string[] | string
  ethnicity: string[] | string
  connectionType: string[] | string
  entityType: string
  yearRange: [number, number]
}

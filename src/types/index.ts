export type Task = {
  id: number
  title: string
  created_at: Date
  updated_at: Date
}

export interface LoginResponse {
  id: number
  name: string
  email: string
  token: string // 필요한 다른 필드가 있으면 추가하세요.
  role: string
}

type MigrationTrace = {
  map(
    arg0: (trace: any) => any[],
  ):
    | import("leaflet").LatLngExpression[]
    | import("leaflet").LatLngExpression[][]
  id: number
  network_id: number
  latitude: number
  longitude: number
  migration_year: number
  location_name: string
  reason: string
}

export type Edge = {
  id: number
  targetId: number
  targetType: string
  strength: number
  edgeType: string
  year: number
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
  edges: Edge[]
  migration_traces: MigrationTrace[]
  photo: File
  photoUrl: string
}

export type CsrfToken = {
  csrf_token: string
}
export type Credential = {
  id: number
  email: string
  password: string
  name: string
  role: string
}

// new

export interface Person {
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
  userNetworkEdgeFilter: any
  userNetworkConnectionFilter: any
  userNetworkTraceFilter: any
  userNetworkFilter: any
  networkIds: any
  nationality: string[] | string
  ethnicity: string[] | string
  connectionType: string[] | string
  edgeType: string[] | string
  entityType: string[] | string
  yearRange: [number, number]
  migrationYearRange: [number, number]
  migrationReasons: string[] | string
  selectedMigrationNetworkId: any
  forceIncludeNetworkIds: any
}

export interface Comment {
  id: number
  network_id: number
  user_id: number
  user_name: string // 작성자 이름
  user_role: string // 작성자 역할
  content: string
  created_at: Date
  updated_at: Date
}

export type ProfileUpdateData = {
  name?: string
  email?: string
  role?: string
  current_password?: string // 기존 비밀번호 (비밀번호 변경 시 필수)
  new_password?: string // 새 비밀번호
}

export type ProfileUpdateResponse = {
  success: boolean
  message?: string
  updatedProfile?: {
    id: number
    name: string
    email: string
    updatedAt: Date
  }
}

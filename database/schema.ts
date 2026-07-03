export type FieldType = 'string' | 'number' | 'boolean' | 'json' | 'text';

export interface FieldDefinition {
    type: FieldType;
    required?: boolean;
    default?: any;
}

export type ModelSchema = Record<string, FieldDefinition>;

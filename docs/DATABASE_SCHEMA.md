# Berlitz Operations Platform — Database Schema v1

## Fase actual

Este documento acompaña la migración inicial:

`202606100001_initial_core_schema.sql`

## Tablas incluidas en esta fase

### Seguridad y usuarios

- roles
- profiles

### Catálogo de programas

- programs
- program_packages
- program_prices
- payment_plan_options

### Estudiantes y matrículas

- students
- enrollments

### Planes de pago

- enrollment_payment_plans
- payment_schedule_items

## Tablas que vendrán después

- tbo_groups
- tbo_assignments
- private_cases
- private_case_tasks
- document_templates
- generated_documents
- checklist_items
- modification_requests
- approvals
- sales_targets
- sales_report_entries
- eped_imports
- eped_pace_rows
- eped_absence_rows
- absence_alerts
- pace_alerts
- notifications
- audit_log

## Convención

- IDs principales usan UUID.
- Fechas de creación y actualización usan `created_at` y `updated_at`.
- Estados se guardan con valores controlados.
- Campos críticos se protegerán luego con RLS y requests/aprobaciones.

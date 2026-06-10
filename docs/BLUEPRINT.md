# Berlitz Operations Platform — Blueprint Maestro v1

## Propósito

Berlitz Operations Platform será una plataforma interna para manejar el flujo completo de matrícula y operaciones de Berlitz Puerto Rico.

Flujo principal:

Create Enrollment → TBO Assignment o Private Case → Documents → Checklist → Reports → Requests/Approvals → EPED Monitoring

## Acción principal

La acción principal será **Create Enrollment**, no “Create Student”.

Desde este flujo se crearán matrículas grupales, privadas, online, kids, testing, CyberTeacher/Flex y futuros programas.

## Funciones principales

- Crear estudiante y matrícula desde un solo flujo.
- Generar Customer ID automático usando `003-120-YY-#####`.
- Guardar fecha de matrícula / Agreement Date.
- Seleccionar programa, modalidad, nivel, horario y precio.
- Crear plan de pagos.
- Asignar estudiante automáticamente al TBO correcto si es grupal.
- Crear Private Case si es estudiante privado.
- Generar documentos requeridos según reglas.
- Crear checklist documental y operacional.
- Alimentar reporte de ventas.
- Controlar cambios críticos mediante requests y aprobaciones.
- Importar EPED Pace Report.
- Importar EPED Absence Report.
- Generar alertas de ausencias, pace y merges.
- Mantener audit log.

## Reglas clave

- El asesor solo entra los últimos 5 dígitos del Customer ID.
- Si es matrícula grupal, el sistema intenta asignar TBO automáticamente.
- Si es matrícula privada, el sistema crea Private Case automáticamente.
- Si hay plan de pagos, se requiere autorización de cargo.
- Si es privado intensivo, se requiere anejo privado intensivo.
- Cambios críticos luego de guardar deben pasar por request/aprobación.
- EPED Absence Report debe contar ausencias por fechas distintas, no por líneas de 45 minutos.

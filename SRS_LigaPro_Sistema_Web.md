# Especificación de Requisitos del Sistema (SRS)
## Sistema de Automatización Web — Liga Profesional de Fútbol del Ecuador (LIGAPRO)

**Versión:** 1.0  
**Fecha:** Mayo 2026  
**Estado:** Borrador  
**Basado en:** Reglamento de Competiciones LIGAPRO, versión Julio 2023

---

## Tabla de Contenidos

1. [Introducción](#1-introducción)
2. [Descripción General del Sistema](#2-descripción-general-del-sistema)
3. [Requisitos Funcionales](#3-requisitos-funcionales)
4. [Requisitos No Funcionales](#4-requisitos-no-funcionales)
5. [Requisitos de Interfaz](#5-requisitos-de-interfaz)
6. [Casos de Uso](#6-casos-de-uso)
7. [Modelo de Datos](#7-modelo-de-datos)
8. [Restricciones y Supuestos](#8-restricciones-y-supuestos)
9. [Glosario](#9-glosario)

---

## 1. Introducción

### 1.1 Propósito

Este documento define los requisitos del sistema para la plataforma web de automatización de la **Liga Profesional de Fútbol del Ecuador (LIGAPRO)**. El sistema centraliza la gestión de competiciones, inscripción de clubes, programación de partidos, control disciplinario, patrocinio, acreditaciones y comunicación oficial, conforme al Reglamento de Competiciones vigente (versión Julio 2023).

### 1.2 Alcance

El sistema cubrirá los siguientes dominios:

- Gestión de campeonatos (Serie A y Serie B)
- Inscripción y habilitación de clubes, jugadores y cuerpos técnicos
- Programación de fechas y partidos
- Generación y control de planillas de juego (integración con sistema COMET)
- Gestión de oficiales de partido
- Control disciplinario (tarjetas, sanciones, multas)
- Protocolo de partido y ceremonias
- Gestión de escenarios deportivos y estadios
- Control de dopaje y asuntos médicos
- Módulo VAR (Árbitro Asistente de Video)
- Comunicaciones y notificaciones oficiales
- Marketing y patrocinio

### 1.3 Definiciones y Acrónimos

| Término | Definición |
|---|---|
| LIGAPRO | Liga Profesional de Fútbol del Ecuador |
| FEF | Federación Ecuatoriana de Fútbol |
| CONMEBOL | Confederación Sudamericana de Fútbol |
| FIFA | Federación Internacional de Fútbol Asociación |
| IFAB | International Football Association Board |
| VAR | Video Assistant Referee (Árbitro Asistente de Video) |
| SBU | Salario Básico Unificado |
| UDM | Unidad Deportiva de Multa |
| WADA | World Anti-Doping Agency |
| COMET | Sistema informático de planillas de juego de LIGAPRO |
| EPTS | Electronic Performance Tracking Systems |

### 1.4 Referencias

- Reglamento de Competiciones LIGAPRO, versión Julio 2023
- Resoluciones del Consejo de Presidentes (2019–2023)
- Reglas de Juego IFAB/FIFA vigentes
- Reglamento Antidopaje CONMEBOL/FIFA/WADA

### 1.5 Visión General del Documento

El documento está estructurado en secciones que cubren desde la descripción general del sistema hasta los requisitos funcionales detallados por módulo, los requisitos no funcionales, los casos de uso principales y el modelo de datos propuesto.

---

## 2. Descripción General del Sistema

### 2.1 Perspectiva del Sistema

El sistema es una aplicación web accesible para múltiples roles de usuario (LIGAPRO, clubes, árbitros, oficiales, medios de comunicación), que automatiza los procesos administrativos y operativos del campeonato ecuatoriano de fútbol profesional de primera categoría.

```
┌─────────────────────────────────────────────────────┐
│              PLATAFORMA WEB LIGAPRO                 │
│                                                     │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │
│  │  Gestión │  │ Planillas│  │  Disciplina &  │    │
│  │  Clubes  │  │de Juego  │  │   Sanciones    │    │
│  └──────────┘  └──────────┘  └────────────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │
│  │Programac.│  │ Estadios │  │    Módulo VAR  │    │
│  │Partidos  │  │& Escenarios│ │                │    │
│  └──────────┘  └──────────┘  └────────────────┘    │
│  ┌──────────┐  ┌──────────┐  ┌────────────────┐    │
│  │ Oficiales│  │ Dopaje & │  │  Comunicaciones│    │
│  │ Partido  │  │  Médico  │  │  y Patrocinio  │    │
│  └──────────┘  └──────────┘  └────────────────┘    │
└─────────────────────────────────────────────────────┘
         │              │               │
   ┌─────┴──┐     ┌─────┴──┐     ┌─────┴──┐
   │ Clubes │     │Árbitros│     │Oficiales│
   └────────┘     └────────┘     └─────────┘
```

### 2.2 Funciones Principales del Sistema

- **F1:** Gestión del ciclo de vida de campeonatos (Serie A y Serie B)
- **F2:** Inscripción y habilitación de participantes
- **F3:** Programación automática de fechas y partidos
- **F4:** Generación y validación de planillas de juego
- **F5:** Control disciplinario automatizado (tarjetas, suspensiones, multas)
- **F6:** Gestión de escenarios deportivos y calificación de estadios
- **F7:** Módulo de certificación de infraestructura VAR
- **F8:** Gestión de oficiales de partido
- **F9:** Portal de comunicaciones y notificaciones oficiales
- **F10:** Módulo de control antidopaje
- **F11:** Gestión de acreditaciones y medios de comunicación
- **F12:** Módulo de marketing y patrocinio

### 2.3 Características de los Usuarios

| Rol | Descripción | Nivel de Acceso |
|---|---|---|
| Administrador LIGAPRO | Personal de la Dirección de Competiciones | Total |
| Club (Representante) | Delegado oficial del club afiliado | Club propio |
| Árbitro | Árbitro principal o asistente habilitado | Partido asignado |
| Comisario de Juego | Oficial designado por LIGAPRO | Programación asignada |
| Delegado de Seguridad | Oficial designado por LIGAPRO | Programación asignada |
| Oficial de Patrocinio | Oficial designado por LIGAPRO | Programación asignada |
| Oficial VAR | Árbitro de video designado | Partido asignado |
| Medio de Comunicación | Periodista o canal acreditado | Solo lectura/acreditación |
| Público / Consulta | Usuario externo sin autenticación | Información pública |

### 2.4 Restricciones Generales

- El sistema debe estar disponible 24/7 con alta disponibilidad durante días de partido.
- Toda comunicación oficial debe realizarse a través del correo `competiciones@ligapro.ec` o mediante el portal web.
- Las planillas de juego se generan exclusivamente mediante el sistema COMET integrado.
- Las multas se deducen automáticamente de los derechos económicos/audiovisuales de los clubes.

---

## 3. Requisitos Funcionales

---

### RF-01: Módulo de Gestión de Campeonatos

**RF-01.1 Creación de Campeonato**

El sistema deberá permitir a los administradores de LIGAPRO crear un nuevo campeonato definiendo:

- Nombre y denominación comercial
- Serie (A o B)
- Temporada
- Número de equipos participantes (Serie A: 16 equipos; Serie B: 10 equipos)
- Fases del campeonato

**RF-01.2 Estructura de Fases — Serie A**

El sistema deberá gestionar las tres fases del campeonato Serie A:

- **FASE UNO:** 15 partidos por equipo (todos contra todos, ida). El líder clasifica a la Fase Final.
- **FASE DOS:** 15 partidos por equipo (todos contra todos, vuelta). Los puntos se reinician a cero. El líder clasifica a la Fase Final.
- **FASE FINAL:** Partido de ida y vuelta entre los ganadores de Fase Uno y Fase Dos. El club con mejor posición en la Tabla Acumulada juega de local en la vuelta.

**RF-01.3 Tabla de Posiciones Automática**

El sistema deberá calcular y actualizar automáticamente:

- Tabla de posiciones por fase (Fase Uno, Fase Dos)
- Tabla Clasificatoria o Acumulada (Fase Uno + Fase Dos)
- Criterios de desempate en el siguiente orden:
  1. Mejor saldo de goles
  2. Mayor número de goles marcados
  3. Mejor performance en el enfrentamiento directo
  4. Mayor número de goles como visitante *(solo Tabla Acumulada)*
  5. Sorteo público administrado por LIGAPRO

**RF-01.4 Reglas de Campeón Automático**

Si un mismo club gana Fase Uno y Fase Dos, el sistema deberá:

- Declararlo automáticamente CAMPEÓN SERIE A sin disputar la Fase Final
- Designar como Vicecampeón al siguiente club en la Tabla Acumulada
- Notificar a todos los clubes participantes

**RF-01.5 Descenso Automático**

Al término del campeonato, el sistema deberá identificar y registrar:

- **Serie A:** Los 2 clubes en las posiciones 15ª y 16ª de la Tabla Acumulada descienden a Serie B
- **Serie B:** Los 2 clubes en posiciones 9ª y 10ª descienden a Segunda Categoría

**RF-01.6 Ascenso — Serie B**

El sistema deberá gestionar el ascenso del Campeón y Vicecampeón de Serie B a Serie A, verificando que no sean clubes filiales según el registro de la LIGAPRO.

---

### RF-02: Módulo de Inscripción y Habilitación

**RF-02.1 Registro de Clubes**

El sistema deberá gestionar el registro de clubes con los siguientes requisitos de habilitación:

- Aprobación de la Dirección de Control Económico
- Habilitación para su respectiva Serie
- Estado de sanciones y suspensiones activas
- Confirmación de participación en torneos CONMEBOL (si aplica)

**RF-02.2 Registro de Jugadores**

Para cada jugador, el sistema deberá registrar:

- Datos personales y documento de identificación válido
- Foto de identificación
- Habilitación por parte de LIGAPRO
- Estado de suspensiones activas (tarjetas, sanciones disciplinarias, dopaje)
- Historial de tarjetas amarillas y rojas por fase y temporada

**RF-02.3 Registro de Cuerpo Técnico y Staff**

El sistema deberá permitir registrar:

- Director técnico (o quien haga sus veces)
- Preparador físico
- Médico del club (obligatorio)
- Kinesiólogo
- Personal auxiliar y staff en general

**RF-02.4 Registro de Uniformes**

El sistema deberá gestionar:

- Descripción y colores del uniforme principal y alternos (jugadores y arquero)
- Formulario de cambio/actualización de colores
- Aprobación por parte de la Dirección de Competiciones
- Fecha de vigencia del nuevo uniforme (mínimo 7 días después de aprobación)

**RF-02.5 Apodos de Jugadores**

El sistema deberá incluir un flujo de solicitud y aprobación de apodos de jugadores para uso en camisetas, con validación y autorización previa de LIGAPRO.

---

### RF-03: Módulo de Programación de Partidos

**RF-03.1 Generación del Fixture**

El sistema deberá generar automáticamente el fixture del campeonato respetando:

- Formato todos contra todos (ida y vuelta para Serie A; dos ruedas para Serie B)
- No programar partidos de Serie A durante jornadas FIFA
- Horario unificado para las dos últimas fechas de cada fase cuando los resultados afecten clasificación o descenso

**RF-03.2 Notificación de Programación**

El sistema deberá notificar a los clubes las fechas y horarios con al menos **15 días de anticipación**.

**RF-03.3 Gestión de Postergaciones**

El sistema deberá permitir solicitar postergaciones bajo las siguientes condiciones:

- Partido internacional CONMEBOL/FIFA dentro de las 48 horas: postergación de hasta 24 horas
- Semifinales o finales de torneos CONMEBOL/FIFA: reprogramación a criterio de la Dirección de Competiciones
- La solicitud debe registrar la aprobación o rechazo con justificación

**RF-03.4 Horario Unificado**

Cuando aplique horario unificado, el sistema deberá:

- Marcar los partidos afectados
- Registrar la confirmación de presencia de todos los equipos antes del inicio
- Bloquear la difusión de resultados de otros partidos en pantallas del estadio

**RF-03.5 Reprogramación por Suspensión**

Ante suspensión definitiva de un partido, el sistema deberá:

- Proponer automáticamente la reprogramación a las 19h00 del día siguiente (o 12h00 sin público)
- Registrar el minuto de interrupción y el marcador al momento de la suspensión
- Mantener el estado del partido (jugadores en cancha, sustituciones disponibles, sanciones)

---

### RF-04: Módulo de Planilla de Juego

**RF-04.1 Generación de Planilla**

El sistema deberá integrarse con el sistema **COMET** para generar planillas de juego que incluyan:

- Máximo 23 jugadores (11 titulares + 12 suplentes)
- Máximo 10 integrantes del cuerpo técnico/staff (incluyendo médico y director técnico obligatorios)
- Firma digital del director técnico

**RF-04.2 Validación y Entrega**

El sistema deberá:

- Validar que la planilla se entregue al Comisario de Juego con al menos **70 minutos** de antelación al partido
- Verificar que la planilla incluya nombre y firma del director técnico
- Bloquear modificaciones una vez entregada
- Generar una copia para cada club y el Comisario de Juego

**RF-04.3 Control de Identificación**

El sistema deberá registrar el proceso de identificación de jugadores con:

- Documento de identidad, licencia de conducir o pasaporte (físico o digital)
- Estado de identificación (completo / parcial)
- Mínimo de 7 jugadores identificados para iniciar el partido

**RF-04.4 Gestión de Sustituciones**

El sistema deberá controlar:

- Máximo de **5 sustituciones** por equipo
- Máximo de **3 momentos** para efectuar sustituciones por partido
- Inhabilitación del jugador sustituido que no fue identificado originalmente

---

### RF-05: Módulo de Control Disciplinario

**RF-05.1 Registro de Tarjetas**

El sistema deberá registrar automáticamente:

- Tarjetas amarillas por jugador, por fase, por temporada
- Tarjetas rojas (expulsiones) con los minutos correspondientes
- Limpieza automática de tarjetas amarillas al inicio de cada nueva fase

**RF-05.2 Gestión de Suspensiones**

El sistema deberá:

- Suspender automáticamente al jugador que acumule **5 tarjetas amarillas**
- Aplicar la suspensión independientemente de la fase en que deba cumplirse
- Notificar al club con al menos 24 horas de anticipación al partido siguiente

**RF-05.3 Cálculo Automático de Multas**

El sistema deberá calcular y registrar multas según el tipo de infracción:

| Infracción | Serie A | Serie B |
|---|---|---|
| Tarjeta amarilla (por jugador) | USD 20 | USD 10 |
| Expulsión (por jugador) | USD 100 | USD 50 |
| Incumplimiento de uniforme | USD 500 | USD 500 |
| No uso de parche LIGAPRO | USD 500 c/u | USD 500 c/u |
| Incumplimiento de planilla | USD 500 | USD 500 |
| No presencia en Reunión de Coordinación | USD 500 | USD 500 |
| Incumplimiento protocolo de partido | USD 500 | USD 500 |
| Incumplimiento césped/estadio | USD 500 | USD 500 |
| Reincidencia en multas USD 500 — Serie A | USD 2,000 | — |
| Reincidencia en multas USD 500 — Serie B | — | USD 1,000 |

**RF-05.4 Descuento Automático de Multas**

El sistema deberá descontar automáticamente las multas de los derechos económicos y audiovisuales del club infractor, generando el comprobante correspondiente.

**RF-05.5 Restricción de Comentarios de Árbitros**

El sistema deberá bloquear la publicación de comentarios sobre arbitraje por parte de jugadores o cuerpo técnico durante las **24 horas** siguientes al partido.

---

### RF-06: Módulo de Oficiales de Partido

**RF-06.1 Registro y Designación de Oficiales**

El sistema deberá gestionar la designación de los siguientes oficiales por cada programación:

- Árbitro principal y asistentes (designados por la Comisión Nacional de Árbitros FEF)
- Oficial de Control de Dopaje (Comisión Médica FEF)
- Comisario de Juego (LIGAPRO)
- Delegado de Seguridad (LIGAPRO)
- Oficial de Patrocinio (LIGAPRO)
- Coordinador de Partido (opcional, LIGAPRO)
- Médico de Campo (opcional, LIGAPRO)
- Oficial VAR (cuando aplique)

**RF-06.2 Emisión de Credenciales**

El sistema deberá generar credenciales digitales para cada oficial, con QR de verificación y fecha de vigencia.

**RF-06.3 Informes de Oficiales**

El sistema deberá permitir a cada oficial ingresar su informe post-partido, con validez disciplinaria equivalente a los informes del árbitro principal.

**RF-06.4 Control de Pasabolas**

El sistema deberá registrar:

- Lista de pasabolas (8 o 12) con nombre completo y posición
- Verificación de edad (14 a 17 años)
- Chaleco asignado por LIGAPRO
- Sanciones por incumplimiento (USD 500 por incumplimiento)

---

### RF-07: Módulo de Escenarios Deportivos y Estadios

**RF-07.1 Registro y Calificación de Estadios**

El sistema deberá gestionar el catálogo de escenarios deportivos con:

- Datos generales del estadio (nombre, ubicación, capacidad)
- Estado de calificación por la Dirección de Escenarios Deportivos y Seguridad
- Tipo de superficie (natural o artificial/sintético)
- Certificado FIFA QUALITY PRO vigente (para césped artificial)
- Fecha de vencimiento del certificado y alertas de renovación

**RF-07.2 Solicitud de Cambio de Estadio**

El sistema deberá gestionar solicitudes de cambio de estadio local con:

- Plazo mínimo de **30 días** de anticipación (salvo fuerza mayor)
- Aprobación o rechazo por parte de la Dirección de Escenarios
- Prohibición de ceder la localía

**RF-07.3 Verificación de Césped**

El sistema deberá registrar los resultados de la inspección pre-partido del Comisario de Juego y árbitro, con control de:

- Altura del césped (20mm a 25mm)
- Marcación (tizado) en color blanco
- Dirección del corte (líneas rectas perpendiculares)

**RF-07.4 Protocolo de Irrigación**

El sistema deberá registrar y confirmar el protocolo de irrigación informado por el Comisario de Juego:

- Primera irrigación: -2 horas antes del partido
- Segunda irrigación ligera: -20 minutos antes del partido

---

### RF-08: Módulo VAR (Árbitro Asistente de Video)

**RF-08.1 Calificación de Infraestructura VAR**

El sistema deberá registrar y verificar que cada estadio cuente con:

- Conexión a internet de **100 Mbps** en el sector de móviles de transmisión
- Conexión de **220V** en el sector de móviles
- Infraestructura de cámaras (Goal Line, offside, reversas, principal) a mínimo **7 metros** de altura

**RF-08.2 Certificación de Infraestructura**

El sistema deberá gestionar el flujo de certificación con participación de:

- Dirección de Arbitraje LIGAPRO
- Dirección de Escenarios Deportivos y Seguridad
- Delegado de la empresa titular de derechos televisivos
- Delegado de la empresa proveedora del servicio VAR

**RF-08.3 Designación del Oficial VAR**

El sistema deberá registrar la designación del Oficial VAR con presencia obligatoria **4 horas antes** del inicio del partido.

**RF-08.4 Control de Acceso a la Sala VOR**

El sistema deberá registrar las personas autorizadas en la Sala VOR e informar accesos no autorizados. Las sanciones aplicables:

- Primera infracción: multa de **3 SBU**
- Reincidencia: prohibición de estadio por una fecha

**RF-08.5 Continuidad del Partido sin VAR**

El sistema deberá registrar que la ausencia o falla del sistema VAR **no es causal de suspensión del partido**, aplicando las sanciones correspondientes al club local si fue por falta de infraestructura.

---

### RF-09: Módulo de Protocolo y Ceremonia de Partido

**RF-09.1 Cuenta Regresiva del Partido**

El sistema deberá generar y distribuir digitalmente la cuenta regresiva oficial del partido, indicando los tiempos exactos para cada acto del protocolo:

| Tiempo antes del partido | Acción |
|---|---|
| -30 min | Colocación del arco de salida y pedestal del balón/copa |
| -15 min | Colocación de lonas/banderas con logotipos de la competición |
| -13 min | Ingreso de banderas institucionales de LIGAPRO |
| -9 min 20 seg | Canción oficial de LIGAPRO en altoparlantes |
| -8 min 1 seg | Himno oficial de LIGAPRO en altoparlantes |
| -8 min | Ingreso de árbitros por el arco de salida |
| -7 min 58 seg | Ingreso simultáneo de equipos al campo |
| -5 min | Saludo del equipo visitante a árbitros y equipo local |
| -4 min | Equipos a la zona del faldón LIGAPRO para foto oficial |

**RF-09.2 Control de Calentamiento**

El sistema deberá registrar:

- Inicio del calentamiento: 45 minutos antes del partido
- Retiro a vestuarios: 20 minutos antes del partido
- Uso de chalecos LIGAPRO durante el calentamiento

**RF-09.3 Registro de Actos Institucionales**

El sistema deberá gestionar solicitudes de actos institucionales pre-partido con:

- Solicitud al correo `competiciones@ligapro.ec` con mínimo **72 horas** de anticipación
- Aprobación escrita de LIGAPRO
- El acto debe realizarse hasta **75 minutos antes** del inicio del partido

---

### RF-10: Módulo de Comunicaciones

**RF-10.1 Canal Oficial de Comunicaciones**

El sistema deberá centralizar todas las comunicaciones oficiales entre clubes y LIGAPRO, con envío de copia al correo `competiciones@ligapro.ec` y registro de trazabilidad.

**RF-10.2 Notificaciones Automáticas**

El sistema deberá enviar notificaciones automáticas para:

- Publicación de programaciones (15 días antes)
- Designación de árbitros y oficiales
- Vencimiento de certificados de estadio
- Sanciones disciplinarias aplicadas
- Multas descontadas
- Suspensiones de jugadores

**RF-10.3 Portal de Transparencia Pública**

El sistema deberá publicar en un portal público:

- Tabla de posiciones actualizada
- Fixture y resultados de partidos
- Información de acreditaciones para medios

---

### RF-11: Módulo de Control Antidopaje

**RF-11.1 Asignación de Control de Dopaje**

El sistema deberá gestionar la designación del Oficial de Control de Dopaje por la Comisión Médica de la FEF para cada programación.

**RF-11.2 Verificación de Sala de Dopaje**

El sistema deberá verificar que cada estadio cuente con la sala de dopaje habilitada con el equipamiento requerido (Art. 88 del Reglamento).

**RF-11.3 Registro de Resultados de Dopaje**

El sistema deberá registrar y notificar a LIGAPRO los resultados del control, conforme a la normativa CONMEBOL/FIFA/WADA. Los jugadores con sanción por dopaje no podrán ser habilitados para participar.

---

### RF-12: Módulo de Marketing y Patrocinio

**RF-12.1 Gestión de Parches e Insignias**

El sistema deberá:

- Registrar la distribución de **400 parches** por temporada por club
- Verificar uso del parche de competición LIGAPRO en manga derecha de camisetas
- Gestionar el parche de CAMPEÓN para el club ganador de la Serie A
- Registrar sanciones por no uso (USD 500 por parche no utilizado)

**RF-12.2 Gestión de Chalecos**

El sistema deberá registrar la distribución de chalecos LIGAPRO a cada equipo y verificar su uso obligatorio durante calentamiento, partido y banco de suplentes.

**RF-12.3 Control de Canales Autorizados**

El sistema deberá registrar los canales de televisión autorizados para transmisión y generar alertas en caso de incumplimiento de acceso de cámaras no autorizadas.

---

## 4. Requisitos No Funcionales

### RNF-01: Rendimiento

- El sistema debe responder en menos de **2 segundos** para el 95% de las peticiones en condiciones normales.
- Durante días de partido, el sistema debe soportar un mínimo de **500 usuarios concurrentes** sin degradación del servicio.
- La generación de planillas de juego debe completarse en menos de **30 segundos**.

### RNF-02: Disponibilidad

- El sistema debe garantizar una disponibilidad del **99.5%** anual (uptime).
- El tiempo de mantenimiento programado no debe coincidir con fechas de partido.
- Se debe contar con redundancia en servidores y base de datos.

### RNF-03: Seguridad

- Toda comunicación debe realizarse sobre protocolo **HTTPS/TLS 1.3**.
- La autenticación de usuarios debe implementar **autenticación multifactor (MFA)**.
- Los datos personales de jugadores y oficiales deben estar cifrados en reposo.
- El acceso a cada módulo debe estar controlado por roles y permisos definidos.
- Auditoría completa de acciones realizadas por cada usuario (logs de auditoría).

### RNF-04: Usabilidad

- La interfaz debe ser **responsiva** (adaptable a dispositivos móviles, tabletas y escritorio).
- El sistema debe estar disponible en **idioma español**.
- Los formularios deben incluir validaciones en tiempo real con mensajes de error claros.
- El tiempo de aprendizaje para usuarios nuevos no debe superar **4 horas** de capacitación.

### RNF-05: Mantenibilidad

- El código debe seguir estándares de documentación y estar bajo control de versiones (Git).
- La arquitectura debe permitir añadir nuevos módulos sin afectar los existentes.
- Se deben implementar pruebas automatizadas con cobertura mínima del **80%**.

### RNF-06: Escalabilidad

- El sistema debe poder escalar horizontalmente para soportar el crecimiento de participantes.
- La base de datos debe soportar el histórico de al menos **10 temporadas** sin degradación.

### RNF-07: Interoperabilidad

- El sistema debe integrarse con el sistema **COMET** para la gestión de planillas de juego.
- Debe exponer una **API REST** documentada para integración con sistemas externos (FEF, CONMEBOL).
- Debe admitir exportación de datos en formatos **CSV, PDF y Excel**.

### RNF-08: Trazabilidad

- Todas las transacciones críticas (sanciones, multas, habilitaciones) deben quedar registradas con fecha, hora y usuario responsable.
- Los cambios en programaciones y planillas deben contar con historial de modificaciones.

---

## 5. Requisitos de Interfaz

### 5.1 Interfaz de Usuario (UI)

**Portal Administrativo LIGAPRO:**
- Dashboard con resumen de campeonato activo, próximas fechas y alertas pendientes
- Menú de acceso rápido a módulos: Campeonato, Clubes, Partidos, Disciplina, Oficiales, Estadios, VAR

**Portal de Clubes:**
- Acceso al registro y gestión de jugadores/staff
- Generación y consulta de planillas de juego
- Estado de sanciones y multas
- Solicitud de postergaciones y cambios de estadio
- Notificaciones y comunicados oficiales

**Portal de Árbitros y Oficiales:**
- Visualización de designaciones
- Ingreso de informes post-partido
- Protocolo y cuenta regresiva del partido

**Portal Público:**
- Consulta de tabla de posiciones, fixture y resultados
- Información de acreditaciones para medios

### 5.2 Interfaz de Comunicación

- **Correo electrónico:** Integración con servidor SMTP para envío de notificaciones automáticas
- **API REST:** Para integración con sistemas externos (COMET, FEF, CONMEBOL)
- **Notificaciones Push:** Para alertas en tiempo real durante el partido
- **WebSockets:** Para actualización en tiempo real de marcadores y tabla de posiciones

### 5.3 Interfaz de Base de Datos

- Motor de base de datos relacional (PostgreSQL recomendado)
- ORM para abstracción de acceso a datos
- Esquema versionado mediante migraciones

---

## 6. Casos de Uso

### CU-01: Habilitar Club para Campeonato

| Campo | Detalle |
|---|---|
| **Actores** | Administrador LIGAPRO, Representante de Club |
| **Precondición** | El club debe estar registrado en el sistema |
| **Flujo Principal** | 1. El club completa los requisitos del Art. 7 del Reglamento. 2. LIGAPRO verifica aprobación económica. 3. LIGAPRO verifica habilitación de jugadores y staff. 4. El sistema actualiza el estado del club a "Habilitado". 5. El sistema notifica al club por correo electrónico. |
| **Flujo Alternativo** | Si algún requisito no se cumple, el sistema genera una alerta indicando los puntos pendientes. |
| **Postcondición** | El club aparece como habilitado en el fixture del campeonato correspondiente. |

---

### CU-02: Generar y Entregar Planilla de Juego

| Campo | Detalle |
|---|---|
| **Actores** | Representante de Club, Comisario de Juego |
| **Precondición** | El club está habilitado y el partido está programado |
| **Flujo Principal** | 1. El club accede al módulo de planillas con 70+ minutos de anticipación. 2. Selecciona los 23 jugadores y 10 integrantes del staff. 3. El director técnico firma digitalmente la planilla. 4. El sistema valida y envía la planilla al Comisario de Juego. 5. El Comisario recibe la planilla y confirma la recepción. 6. El sistema bloquea modificaciones. |
| **Flujo Alternativo** | Si la planilla no tiene firma del DT, el sistema rechaza la entrega y concede 10 minutos para corregir. Si no se corrige, el partido se declara perdido. |
| **Postcondición** | La planilla queda registrada e inmodificable en el sistema. |

---

### CU-03: Registrar Resultado y Tarjetas de un Partido

| Campo | Detalle |
|---|---|
| **Actores** | Comisario de Juego, Árbitro |
| **Precondición** | El partido ha finalizado |
| **Flujo Principal** | 1. El árbitro ingresa el resultado final. 2. Registra tarjetas amarillas y rojas con minuto y jugador. 3. El sistema actualiza automáticamente la tabla de posiciones. 4. El sistema verifica si algún jugador alcanzó 5 tarjetas amarillas. 5. Si es así, genera la suspensión automática y notifica al club. 6. El sistema calcula las multas correspondientes y las programa para descuento. |
| **Postcondición** | Tabla de posiciones actualizada, sanciones aplicadas y multas registradas. |

---

### CU-04: Solicitar Postergación de Partido

| Campo | Detalle |
|---|---|
| **Actores** | Representante de Club, Dirección de Competiciones |
| **Precondición** | El partido está programado y el motivo es participación en torneo CONMEBOL/FIFA |
| **Flujo Principal** | 1. El club ingresa la solicitud de postergación con documentación de respaldo. 2. El sistema verifica que el partido internacional esté dentro de las 48 horas. 3. La Dirección de Competiciones aprueba o rechaza la solicitud. 4. Si se aprueba, el sistema reprograma el partido con hasta 24 horas de diferencia. 5. Ambos clubes son notificados automáticamente. |
| **Postcondición** | El partido queda reprogramado o la solicitud queda rechazada con justificación. |

---

### CU-05: Calificar Estadio con Infraestructura VAR

| Campo | Detalle |
|---|---|
| **Actores** | Dirección de Arbitraje, Dirección de Escenarios, Club Local |
| **Precondición** | El club debe registrar su estadio antes del inicio del campeonato |
| **Flujo Principal** | 1. El club registra el estadio con sus datos técnicos. 2. La Dirección de Arbitraje programa la inspección. 3. Se verifica conectividad (100 Mbps), alimentación eléctrica (220V) y altura de cámaras (7 metros mínimo). 4. El sistema registra la certificación con firma digital de los delegados presentes. 5. El estadio queda habilitado para partidos con VAR. |
| **Flujo Alternativo** | Si la infraestructura no cumple, el estadio no es calificado y el club debe designar un estadio alternativo calificado. |
| **Postcondición** | El estadio figura como calificado para competiciones con VAR. |

---

## 7. Modelo de Datos

### Entidades Principales

```
┌─────────────────┐     ┌─────────────────┐     ┌──────────────────┐
│   CAMPEONATO    │     │      CLUB        │     │    JUGADOR       │
├─────────────────┤     ├─────────────────┤     ├──────────────────┤
│ id              │     │ id              │     │ id               │
│ nombre          │     │ nombre          │     │ nombre_completo  │
│ temporada       │     │ serie           │     │ documento_id     │
│ serie (A/B)     │     │ estadio_id      │     │ club_id          │
│ fase_actual     │     │ estado_habilitado│     │ posicion         │
│ num_equipos     │     │ saldo_multas    │     │ estado_habilitado │
└────────┬────────┘     └────────┬────────┘     │ tarjetas_amarillas│
         │                       │              │ tarjetas_rojas   │
         │              ┌────────┴────────┐     │ suspendido       │
         │              │   STAFF_TECNICO │     └─────────┬────────┘
         │              ├─────────────────┤               │
         │              │ id              │               │
         │              │ club_id         │      ┌────────┴──────┐
         │              │ nombre          │      │   PLANILLA    │
         │              │ rol             │      ├───────────────┤
         │              │ habilitado      │      │ id            │
         │              └─────────────────┘      │ partido_id    │
         │                                       │ club_id       │
┌────────┴────────┐                              │ jugadores[]   │
│     PARTIDO     │                              │ staff[]       │
├─────────────────┤     ┌─────────────────┐      │ firmada       │
│ id              │     │    OFICIAL      │      │ entregada_min │
│ campeonato_id   │─────│ id              │      └───────────────┘
│ fase            │     │ tipo            │
│ club_local_id   │     │ nombre          │
│ club_visitante_id│    │ partido_id      │
│ estadio_id      │     │ credencial      │
│ fecha_hora      │     └─────────────────┘
│ resultado_local │
│ resultado_visit │     ┌─────────────────┐
│ estado          │     │    ESTADIO      │
│ minuto_suspens. │     ├─────────────────┤
└─────────────────┘     │ id              │
                        │ nombre          │
                        │ club_id         │
                        │ tipo_cesped     │
                        │ certificado_fifa│
                        │ vencim_certif.  │
                        │ infraestructura_var│
                        │ calificado      │
                        └─────────────────┘
```

### Entidades de Disciplina

```
┌─────────────────┐     ┌─────────────────┐
│    SANCION      │     │     MULTA       │
├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │
│ jugador_id      │     │ club_id         │
│ tipo (amarilla/ │     │ concepto        │
│  roja/suspensión│     │ monto_usd       │
│  /multa)        │     │ fecha_aplicacion│
│ partido_id      │     │ estado (pendient│
│ minuto          │     │  /descontada)   │
│ descripcion     │     │ fecha_descuento │
│ estado          │     └─────────────────┘
└─────────────────┘
```

---

## 8. Restricciones y Supuestos

### 8.1 Restricciones

- El sistema debe operar exclusivamente en español.
- Las multas solo pueden ser descontadas de los derechos económicos y audiovisuales de los clubes; no se acepta pago directo a través del sistema.
- El módulo VAR es obligatorio únicamente a partir de la Fase DOS del campeonato Serie A, temporada 2023 en adelante.
- Los clubes filiales no pueden ascender de Serie B a Serie A; el sistema debe verificar este estado automáticamente.
- Ningún club puede ceder la localía; el sistema debe bloquear esta acción.
- El sistema no puede suspender un partido por falta del sistema VAR.

### 8.2 Supuestos

- Los clubes cuentan con acceso a internet y dispositivos para interactuar con el sistema.
- COMET proporciona una API para la integración de planillas de juego.
- La FEF y CONMEBOL proveen datos de partidos internacionales para el control de postergaciones.
- Los árbitros y oficiales cuentan con dispositivos móviles para ingresar informes en el campo.
- Las empresas proveedoras del servicio VAR integran sus sistemas con la plataforma LIGAPRO.

---

## 9. Glosario

| Término | Definición |
|---|---|
| **Tabla Acumulada** | Tabla de posiciones que combina los puntos obtenidos en la Fase Uno y la Fase Dos del campeonato Serie A |
| **Comisario de Juego** | Oficial designado por LIGAPRO responsable de supervisar el correcto desarrollo del partido |
| **Planilla de Juego** | Documento oficial generado por el sistema COMET que lista los jugadores y staff de cada club para un partido |
| **Fase Final** | Instancia decisiva del campeonato Serie A disputada entre los ganadores de Fase Uno y Fase Dos |
| **EPTS** | Electronic Performance Tracking Systems. Dispositivos de seguimiento del rendimiento físico permitidos durante el partido |
| **Sala VOR** | Video Operation Room. Sala donde opera el equipo del VAR durante el partido |
| **Pasabola** | Persona (de 14 a 17 años) encargada de proveer balones durante el partido |
| **Descenso** | Proceso por el cual un club pierde su categoría y pasa a competir en la división inferior |
| **Club Filial** | Club vinculado institucionalmente a otro club de mayor categoría, para el cual existen restricciones de ascenso |
| **SBU** | Salario Básico Unificado. Unidad de referencia para el cálculo de determinadas sanciones |

---

*Fin del documento SRS — Sistema de Automatización Web LIGAPRO v1.0*

*Este documento está sujeto a revisión y actualización conforme evolucionen los requerimientos del Consejo de Presidentes de la LIGAPRO.*

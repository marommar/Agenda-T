// ============================================================================
// WHATSAPP.JS - CAPA DE INTEGRACIÓN MOCK DE WABA (WhatsApp Business API)
// Simula el comportamiento de una conexión telefónica real emitiendo logs.
// En producción, aquí se inserta el Token Oficial de Meta o Twilio.
// ============================================================================

/**
 * init()
 * Carga las credenciales y prepara la pasarela de puente con los servidores de WhatsApp.
 */
function init() {
  console.log('[WHATSAPP MOCK] Inicializando cliente de WhatsApp...');
  setTimeout(() => {
    console.log('[WHATSAPP MOCK] Cliente listo. (Simulación)');
    console.log('[WHATSAPP MOCK] Los recordatorios están activos en segundo plano.');
  }, 500);
}

function sendReminder(cita) {
  const msg = `¡Hola ${cita.nombre}! 👋 Te recordamos que mañana ${cita.fecha} a las ${cita.hora} tienes una cita de *${cita.servicio}* en Luxe Salon. ¿Confirmas tu asistencia? Responde *SÍ* para confirmar o *NO* para cancelar.`;
  console.log(`[WHATSAPP MOCK] → +${cita.telefono || '000'}: ${msg}`);
  return msg;
}

module.exports = { init, sendReminder };

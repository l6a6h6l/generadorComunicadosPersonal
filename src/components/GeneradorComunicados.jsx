import React, { useState, useEffect } from 'react';
import { Terminal, AlertTriangle, Clock, CheckCircle, RefreshCw, Copy, Trash2, ChevronRight, Zap, MessageSquare, Bell, Plus, Minus, User, Lock, Eye, EyeOff, CreditCard, FileText, AlertOctagon, Command, Activity, Cpu, Database, Shield, Wifi, Monitor } from 'lucide-react';

// Constantes
const USUARIOS_VALIDOS = [
  { usuario: 'luishl', password: 'l1u2i3s4h5l6' }
];

const SERVICIOS_TRANSACCIONALES = [
  { id: 'datafast-visa-mc', nombre: '💳 DATAFAST VISA-MC', descripcion: 'Transacciones locales Visa (débito/crédito) y MasterCard (crédito) en red propia', categoria: 'datafast', emoji: '💳' },
  { id: 'datafast-diners-dc', nombre: '💳 DATAFAST DINERS-DC', descripcion: 'Transacciones locales Diners (débito/crédito) y Discover (crédito) en red propia', categoria: 'datafast', emoji: '💳' },
  { id: 'banred-pago-tc', nombre: '🏦 BANRED (PAGO TC)', descripcion: 'Transacciones entre bancos asociados BANRED: tarjetas de crédito, cuentas corrientes y ahorro', categoria: 'banred', emoji: '🏦' },
  { id: 'banred-base24', nombre: '🏧 BANRED BASE 24', descripcion: 'Transacciones tarjetas de débito Banco Pichincha y bancos asociados BANRED', categoria: 'banred', emoji: '🏧' },
  { id: 'banred-base25', nombre: '🏧 BANRED BASE 25 (ATM)', descripcion: 'Transacciones ATM tarjetas de crédito Banco Pichincha y bancos asociados BANRED', categoria: 'banred', emoji: '🏧' },
  { id: 'usp-atalla', nombre: '🔐 USP ATALLA', descripcion: 'Validación de tarjetas propias de débito y crédito BANCO PICHINCHA', categoria: 'validacion', emoji: '🔐' },
  { id: 'efectivo-express', nombre: '💵 EFECTIVO EXPRESS', descripcion: 'Avances de efectivo por ventanilla Banco Pichincha', categoria: 'efectivo', emoji: '💵' },
  { id: 'diners-internacional-1', nombre: '🌍 DINERS INTERNACIONAL 1', descripcion: 'Transacciones crédito Diners/Discover: tarjetas propias en red ajena y ajenas en red propia', categoria: 'internacional', emoji: '🌍' },
  { id: 'diners-internacional-2', nombre: '🌎 DINERS INTERNACIONAL 2', descripcion: 'Transacciones crédito Diners/Discover: tarjetas propias en red ajena y ajenas en red propia', categoria: 'internacional', emoji: '🌎' },
  { id: 'pulse-discover', nombre: '💎 PULSE/DISCOVER FS', descripcion: 'Transacciones tarjetas ajenas Diners y Discover en cajeros autorizados', categoria: 'internacional', emoji: '💎' },
  { id: 'llaves-dci', nombre: '🔑 LLAVES DCI', descripcion: 'Intercambio de llaves con franquicias DCI/Discover', categoria: 'seguridad', emoji: '🔑' },
  { id: 'visa-int-emision', nombre: '✈️ VISA INT. EMISIÓN', descripcion: 'Transacciones débito/crédito tarjetas propias en red ajena', categoria: 'internacional', emoji: '✈️' },
  { id: 'visa-int-adquirencia', nombre: '🛬 VISA INT. ADQUIRENCIA', descripcion: 'Transacciones crédito tarjetas ajenas en red propia', categoria: 'internacional', emoji: '🛬' },
  { id: 'mastercard-mci', nombre: '🌐 MASTERCARD MCI', descripcion: 'Transacciones crédito tarjetas propias en red ajena', categoria: 'internacional', emoji: '🌐' },
  { id: 'mastercard-mds', nombre: '🌏 MASTERCARD MDS', descripcion: 'Transacciones crédito tarjetas ajenas en red propia', categoria: 'internacional', emoji: '🌏' },
  { id: 'broker', nombre: '🤝 BROKER', descripcion: 'Avances de efectivo en cajeros ATM sin tarjeta de crédito', categoria: 'efectivo', emoji: '🤝' },
  { id: 'jardin-azuayo', nombre: '🌱 JARDÍN AZUAYO', descripcion: 'Transacciones débito Visa de Cooperativa Jardín Azuayo', categoria: 'cooperativas', emoji: '🌱' },
  { id: 'dock', nombre: '🚧 DOCK (IMPLEMENTANDO)', descripcion: 'Transacciones débito Banco Diners Club del Ecuador', categoria: 'implementacion', emoji: '🚧' },
  { id: 'bpc-bp', nombre: '🚌 BPC-BP', descripcion: 'Transacciones tarjeta prepago de transporte Banco Pichincha', categoria: 'prepago', emoji: '🚌' }
];

const OPCIONES_ENCOLAMIENTO = [
  'Variable General',
  'OTP General',
  'SMS Masivo',
  'Notificaciones Push',
  'Validaciones KYC'
];

// Funciones utilitarias
const formatearFecha = (fechaISO) => {
  if (!fechaISO) return "";
  const [year, month, day] = fechaISO.split('-');
  return `${day}/${month}/${year}`;
};

const calcularDuracion = (fechaInicio, horaInicio, fechaFin, horaFin) => {
  try {
    if (!fechaInicio || !horaInicio || !fechaFin || !horaFin) return '00:00:00';
    const inicio = new Date(`${fechaInicio}T${horaInicio}`);
    const fin = new Date(`${fechaFin}T${horaFin}`);
    if (isNaN(inicio.getTime()) || isNaN(fin.getTime())) return '00:00:00';
    const diferencia = fin.getTime() - inicio.getTime();
    if (diferencia < 0) return 'Error';
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    const segundos = Math.floor((diferencia % (1000 * 60)) / 1000);
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  } catch (error) {
    return '00:00:00';
  }
};

// Matrix Rain Effect Component con binario y caracteres
const MatrixRain = () => {
  const [drops, setDrops] = useState([]);
  
  useEffect(() => {
    const columns = Math.floor(window.innerWidth / 20);
    const initialDrops = Array(columns).fill(0).map(() => ({
      y: Math.random() * -100,
      speed: Math.random() * 2 + 1,
      opacity: Math.random() * 0.5 + 0.3
    }));
    setDrops(initialDrops);
    
    const interval = setInterval(() => {
      setDrops(prev => prev.map(drop => ({
        ...drop,
        y: drop.y > window.innerHeight ? Math.random() * -100 : drop.y + drop.speed
      })));
    }, 50);
    
    return () => clearInterval(interval);
  }, []);
  
  const getRandomChar = () => {
    const chars = ['0', '1', '01', '10', '11', '00', '☠', '⚡', '💀', '🔥'];
    return chars[Math.floor(Math.random() * chars.length)];
  };
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {drops.map((drop, i) => (
        <div
          key={i}
          className="absolute text-green-500 text-xs"
          style={{
            left: `${i * 20}px`,
            top: `${drop.y}px`,
            opacity: drop.opacity,
            textShadow: '0 0 8px #00ff00, 0 0 20px #00ff00',
            filter: 'blur(0.5px)',
            animation: 'pulse 2s infinite'
          }}
        >
          {getRandomChar()}
        </div>
      ))}
    </div>
  );
};

export default function GeneradorComunicados() {
  // Estados de autenticación
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loginForm, setLoginForm] = useState({ usuario: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Estados principales
  const [tipo, setTipo] = useState('evento-inicio');
  const [modoBLU, setModoBLU] = useState(false);
  const [tipoBLU, setTipoBLU] = useState('aplicacion');
  const [multiplesAlertamientos, setMultiplesAlertamientos] = useState(false);
  const [periodosAlertamiento, setPeriodosAlertamiento] = useState([
    { fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '', duracion: '00:00:00' }
  ]);
  const [multiplesEncolamientos, setMultiplesEncolamientos] = useState(false);
  const [serviciosEncolamiento, setServiciosEncolamiento] = useState([
    { tipo: 'Variable General', tipoCustom: '', fechaInicio: '', horaInicio: '', fechaFin: '', horaFin: '', duracion: '00:00:00', encolados: '' }
  ]);
  const [formData, setFormData] = useState({
    descripcion: '',
    impacto: '',
    escaladoA: '',
    motivo: '',
    impactoMant: '',
    ejecutor: '',
    fechaInicio: '',
    horaInicio: '',
    estadoInicio: 'En revisión',
    acciones: '',
    accionesEjecutadas: '',
    accionesEnCurso: '',
    fechaInicioFin: '',
    horaInicioFin: '',
    fechaFin: '',
    horaFin: '',
    duracionCalculada: '00:00:00',
    estadoFin: 'Recuperado',
    nota: ''
  });
  const [resultado, setResultado] = useState('');
  const [mostrarAlerta, setMostrarAlerta] = useState(false);
  const [alertaMensaje, setAlertaMensaje] = useState('');
  const [mostrarServicios, setMostrarServicios] = useState(false);
  const [tiempoAbierto, setTiempoAbierto] = useState(Date.now());
  const [mostrarActualizacion, setMostrarActualizacion] = useState(false);
  const [mostrarConfirmacionDuracion, setMostrarConfirmacionDuracion] = useState(false);
  const [noPreguntar, setNoPreguntar] = useState(false);
  const [errorFechaFin, setErrorFechaFin] = useState('');
  const [mostrarErrorFecha, setMostrarErrorFecha] = useState(false);
  const [sugerenciasFecha, setSugerenciasFecha] = useState([]);
  const [autoLimpiarEscalado, setAutoLimpiarEscalado] = useState(true);
  const [ultimoEscalado, setUltimoEscalado] = useState('');

  // Establecer fechas al cargar
  useEffect(() => {
    establecerFechaHoraActual();
  }, []);

  // Timer del semáforo
  useEffect(() => {
    const interval = setInterval(() => {
      const horasAbierto = (Date.now() - tiempoAbierto) / (1000 * 60 * 60);
      if (!noPreguntar && horasAbierto >= 1 && horasAbierto % 1 < 0.017) {
        setMostrarActualizacion(true);
      }
    }, 60000);
    return () => clearInterval(interval);
  }, [tiempoAbierto, noPreguntar]);

  // Calcular duración
  useEffect(() => {
    if (!formData.fechaInicioFin || !formData.horaInicioFin || !formData.fechaFin || !formData.horaFin) return;
    const duracion = calcularDuracion(formData.fechaInicioFin, formData.horaInicioFin, formData.fechaFin, formData.horaFin);
    setFormData(prev => ({ ...prev, duracionCalculada: duracion }));
  }, [formData.fechaInicioFin, formData.horaInicioFin, formData.fechaFin, formData.horaFin]);

  // Actualizar estados por defecto
  useEffect(() => {
    setFormData(prev => {
      let estadoInicio = prev.estadoInicio;
      let estadoFin = prev.estadoFin;
      if (tipo === 'evento-inicio' || tipo === 'incidente-inicio') estadoInicio = 'En revisión';
      else if (tipo === 'evento-fin' || tipo === 'incidente-fin') estadoFin = 'Recuperado';
      else if (tipo === 'mantenimiento-inicio') estadoInicio = 'En curso';
      else if (tipo === 'mantenimiento-fin') estadoFin = 'Finalizado';
      return { ...prev, estadoInicio, estadoFin };
    });
  }, [tipo]);

  // Funciones de autenticación
  const handleLogin = () => {
    const usuarioValido = USUARIOS_VALIDOS.find(
      user => user.usuario === loginForm.usuario && user.password === loginForm.password
    );
    if (usuarioValido) {
      setIsAuthenticated(true);
      setLoginError('');
    } else {
      setLoginError('ACCESO DENEGADO');
      setTimeout(() => setLoginError(''), 3000);
    }
  };

  const handleLoginInputChange = (e) => {
    const { name, value } = e.target;
    setLoginForm(prev => ({ ...prev, [name]: value }));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setLoginForm({ usuario: '', password: '' });
  };

  // Funciones de servicios
  const seleccionarServicio = (servicio) => {
    const campoImpacto = tipo.startsWith('mantenimiento-') ? 'impactoMant' : 'impacto';
    const impactoActual = formData[campoImpacto];
    const nuevoImpacto = !impactoActual ? servicio.descripcion : impactoActual + '\n' + servicio.descripcion;
    setFormData(prev => ({ ...prev, [campoImpacto]: nuevoImpacto }));
    setAlertaMensaje(`[SERVICIO_AGREGADO] ${servicio.nombre}`);
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 2000);
  };

  const limpiarImpactos = () => {
    const campoImpacto = tipo.startsWith('mantenimiento-') ? 'impactoMant' : 'impacto';
    setFormData(prev => ({ ...prev, [campoImpacto]: '' }));
    setAlertaMensaje('[IMPACTOS_LIMPIADOS]');
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 2000);
  };

  // Funciones del semáforo
  const calcularTiempoAbierto = () => {
    const diferencia = Date.now() - tiempoAbierto;
    const horas = Math.floor(diferencia / (1000 * 60 * 60));
    const minutos = Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60));
    return { horas, minutos, total: diferencia / (1000 * 60 * 60) };
  };

  const getEstadoSemaforo = () => {
    const { total } = calcularTiempoAbierto();
    if (total < 1) return { color: '[OK]', estado: 'SINCRONIZADO', clase: 'text-green-400' };
    if (total < 4) return { color: '[ALERTA]', estado: 'REVISAR', clase: 'text-yellow-400' };
    return { color: '[CRÍTICO]', estado: 'DESINCRONIZADO', clase: 'text-red-400' };
  };

  const actualizarFechasAhora = () => {
    establecerFechaHoraActual();
    setTiempoAbierto(Date.now());
    setMostrarActualizacion(false);
    setAlertaMensaje('[SINCRONIZACIÓN_EXITOSA]');
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  // Funciones principales
  const establecerFechaHoraActual = () => {
    const hoy = new Date();
    const fechaActual = hoy.toISOString().split('T')[0];
    const horaActual = hoy.toTimeString().split(' ')[0];
    
    setFormData(prev => ({
      ...prev,
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaInicioFin: fechaActual,
      horaInicioFin: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual
    }));
    
    setPeriodosAlertamiento([{
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual,
      duracion: '00:00:00'
    }]);
    
    setServiciosEncolamiento([{
      tipo: 'Variable General',
      tipoCustom: '',
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual,
      duracion: '00:00:00',
      encolados: ''
    }]);
  };

  const limpiarCampos = () => {
    establecerFechaHoraActual();
    setFormData(prev => ({
      ...prev,
      descripcion: '',
      impacto: '',
      escaladoA: '',
      motivo: '',
      impactoMant: '',
      ejecutor: '',
      acciones: '',
      accionesEjecutadas: '',
      accionesEnCurso: '',
      nota: ''
    }));
    setMultiplesAlertamientos(false);
    setMultiplesEncolamientos(false);
    setMostrarConfirmacionDuracion(false);
    setErrorFechaFin('');
    setMostrarErrorFecha(false);
    setSugerenciasFecha([]);
    setAlertaMensaje('[CAMPOS_LIMPIADOS]');
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  const agregarPeriodo = () => {
    const hoy = new Date();
    const fechaActual = hoy.toISOString().split('T')[0];
    const horaActual = hoy.toTimeString().split(' ')[0];
    setPeriodosAlertamiento(prev => [...prev, {
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual,
      duracion: '00:00:00'
    }]);
  };

  const eliminarPeriodo = (index) => {
    if (periodosAlertamiento.length > 1) {
      setPeriodosAlertamiento(prev => prev.filter((_, i) => i !== index));
    }
  };

  const agregarServicioEncolamiento = () => {
    const hoy = new Date();
    const fechaActual = hoy.toISOString().split('T')[0];
    const horaActual = hoy.toTimeString().split(' ')[0];
    setServiciosEncolamiento(prev => [...prev, {
      tipo: 'Variable General',
      tipoCustom: '',
      fechaInicio: fechaActual,
      horaInicio: horaActual,
      fechaFin: fechaActual,
      horaFin: horaActual,
      duracion: '00:00:00',
      encolados: ''
    }]);
  };

  const eliminarServicioEncolamiento = (index) => {
    if (serviciosEncolamiento.length > 1) {
      setServiciosEncolamiento(prev => prev.filter((_, i) => i !== index));
    }
  };

  const actualizarServicioEncolamiento = (index, campo, valor) => {
    setServiciosEncolamiento(prev => 
      prev.map((servicio, i) => {
        if (i === index) {
          const nuevoServicio = { ...servicio, [campo]: valor };
          if (nuevoServicio.fechaInicio && nuevoServicio.horaInicio && nuevoServicio.fechaFin && nuevoServicio.horaFin) {
            nuevoServicio.duracion = calcularDuracion(nuevoServicio.fechaInicio, nuevoServicio.horaInicio, nuevoServicio.fechaFin, nuevoServicio.horaFin);
          }
          return nuevoServicio;
        }
        return servicio;
      })
    );
  };

  const actualizarPeriodo = (index, campo, valor) => {
    setPeriodosAlertamiento(prev => 
      prev.map((periodo, i) => {
        if (i === index) {
          const nuevoPeriodo = { ...periodo, [campo]: valor };
          if (nuevoPeriodo.fechaInicio && nuevoPeriodo.horaInicio && nuevoPeriodo.fechaFin && nuevoPeriodo.horaFin) {
            nuevoPeriodo.duracion = calcularDuracion(nuevoPeriodo.fechaInicio, nuevoPeriodo.horaInicio, nuevoPeriodo.fechaFin, nuevoPeriodo.horaFin);
          }
          return nuevoPeriodo;
        }
        return periodo;
      })
    );
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const seleccionarTipo = (nuevoTipo) => {
    const tipoAnterior = tipo;
    setTipo(nuevoTipo);
    
    if ((tipoAnterior.endsWith('-inicio') || tipoAnterior.endsWith('-avance') || tipoAnterior.endsWith('-seguimiento')) && nuevoTipo.endsWith('-fin')) {
      const hoy = new Date();
      const fechaActual = hoy.toISOString().split('T')[0];
      const horaActual = hoy.toTimeString().split(' ')[0];
      
      setFormData(prev => ({
        ...prev,
        fechaInicioFin: prev.fechaInicio,
        horaInicioFin: prev.horaInicio,
        fechaFin: fechaActual,
        horaFin: horaActual
      }));
      
      setAlertaMensaje('[FECHAS_AUTO_COMPLETADAS]');
      setMostrarAlerta(true);
      setTimeout(() => setMostrarAlerta(false), 4000);
    }
  };

  const validarFechasFin = () => {
    const { fechaInicioFin, horaInicioFin, fechaFin, horaFin } = formData;
    
    if (!fechaInicioFin || !horaInicioFin || !fechaFin || !horaFin) {
      setErrorFechaFin('');
      return true;
    }

    try {
      const inicio = new Date(`${fechaInicioFin}T${horaInicioFin}`);
      const fin = new Date(`${fechaFin}T${horaFin}`);
      
      if (fin < inicio) {
        setErrorFechaFin(`[ERROR] HORA_FIN < HORA_INICIO`);
        const hoy = new Date();
        const fechaActual = hoy.toISOString().split('T')[0];
        const horaActual = hoy.toTimeString().split(' ')[0];
        
        setSugerenciasFecha([
          { texto: `[CORREGIR] USAR_HORA_ACTUAL: ${formatearFecha(fechaActual)} ${horaActual}`, fecha: fechaActual, hora: horaActual }
        ]);
        setMostrarErrorFecha(true);
        return false;
      }
      
      setErrorFechaFin('');
      setSugerenciasFecha([]);
      setMostrarErrorFecha(false);
      return true;
    } catch (error) {
      setErrorFechaFin('[ERROR] FALLO_PROCESAMIENTO_FECHA');
      return false;
    }
  };

  const aplicarSugerenciaFecha = (fecha, hora) => {
    setFormData(prev => ({ ...prev, fechaFin: fecha, horaFin: hora }));
    setErrorFechaFin('');
    setSugerenciasFecha([]);
    setMostrarErrorFecha(false);
    setAlertaMensaje(`[FECHA_CORREGIDA]`);
    setMostrarAlerta(true);
    setTimeout(() => setMostrarAlerta(false), 3000);
  };

  const calcularDuracionTotal = () => {
    if (!multiplesAlertamientos || periodosAlertamiento.length === 0) return formData.duracionCalculada;
    let totalSegundos = 0;
    periodosAlertamiento.forEach(periodo => {
      if (periodo.duracion !== '00:00:00' && periodo.duracion !== 'Error') {
        const [horas, minutos, segundos] = periodo.duracion.split(':').map(Number);
        totalSegundos += (horas * 3600) + (minutos * 60) + segundos;
      }
    });
    const horas = Math.floor(totalSegundos / 3600);
    const minutos = Math.floor((totalSegundos % 3600) / 60);
    const segundos = totalSegundos % 60;
    return `${String(horas).padStart(2, '0')}:${String(minutos).padStart(2, '0')}:${String(segundos).padStart(2, '0')}`;
  };

  const formatearPeriodosMultiples = () => {
    if (!multiplesAlertamientos || periodosAlertamiento.length === 0) {
      const fechaInicioFormateada = formatearFecha(formData.fechaInicioFin);
      const fechaFinFormateada = formatearFecha(formData.fechaFin);
      return `Inicio: ${fechaInicioFormateada} - ${formData.horaInicioFin}\nFin: ${fechaFinFormateada} - ${formData.horaFin}\nDuración: ${formData.duracionCalculada}`;
    }
    let resultado = `Duración Total: ${calcularDuracionTotal()}\nPeríodos de Alertamiento:`;
    periodosAlertamiento.forEach((periodo, index) => {
      const fechaInicioFormateada = formatearFecha(periodo.fechaInicio);
      const fechaFinFormateada = formatearFecha(periodo.fechaFin);
      resultado += `\n        Período ${index + 1}:`;
      resultado += `\n        Inicio: ${fechaInicioFormateada} - ${periodo.horaInicio}`;
      resultado += `\n        Fin: ${fechaFinFormateada} - ${periodo.horaFin}`;
      resultado += `\n        Duración: ${periodo.duracion}`;
      if (index < periodosAlertamiento.length - 1) resultado += `\n`;
    });
    return resultado;
  };

  const formatearImpacto = (impacto, valorPorDefecto) => {
    const impactoVal = impacto || valorPorDefecto;
    const lineas = impactoVal.split('\n').filter(linea => linea.trim() !== '');
    if (lineas.length <= 1) return `Impacto: ${impactoVal}`;
    let resultado = "Impacto:";
    lineas.forEach(linea => {
      const lineaLimpia = linea.trim();
      if (lineaLimpia) {
        resultado += `\n        • ${lineaLimpia}`;
      }
    });
    return resultado;
  };

  const formatearNotaEncolamientos = () => {
    if (!multiplesEncolamientos || serviciosEncolamiento.length === 0) return '';
    let resultado = 'Encolamientos por servicio:';
    serviciosEncolamiento.forEach(servicio => {
      if (servicio.encolados && servicio.encolados.trim() !== '') {
        const tipoServicio = servicio.tipo === 'Otro' ? servicio.tipoCustom : servicio.tipo;
        resultado += `\n        • ${tipoServicio}: ${servicio.encolados}`;
      }
    });
    return resultado;
  };

  const generarMensaje = () => {
    if (tipo.endsWith('-fin') && !validarFechasFin()) {
      return;
    }
    
    // Validar duración mayor a 4 horas
    if (tipo.endsWith('-fin')) {
      let duracionAValidar = '';
      
      if (multiplesAlertamientos && periodosAlertamiento.length > 0) {
        duracionAValidar = calcularDuracionTotal();
      } else {
        duracionAValidar = formData.duracionCalculada;
      }
      
      // Convertir duración a horas
      const [horas, minutos, segundos] = duracionAValidar.split(':').map(Number);
      const duracionEnHoras = horas + (minutos / 60) + (segundos / 3600);
      
      if (duracionEnHoras > 4) {
        setMostrarConfirmacionDuracion(true);
        return;
      }
    }
    
    generarMensajeInterno();
  };

  const generarMensajeInterno = () => {
    let mensaje = "";
    
    // Guardar el valor actual de escalado antes de limpiarlo
    if (formData.escaladoA && formData.escaladoA.trim() !== '') {
      setUltimoEscalado(formData.escaladoA);
    }
    
    const getTitulo = () => {
      if (!modoBLU) {
        if (tipo.startsWith('evento-')) return 'GESTIÓN EVENTO';
        if (tipo.startsWith('incidente-')) return 'GESTIÓN INCIDENTE';
        if (tipo.startsWith('mantenimiento-')) return tipo.includes('inicio') ? '⚠️ MANTENIMIENTO' : '✅ MANTENIMIENTO';
      }
      if (tipo.startsWith('evento-')) {
        if (tipoBLU === 'bian') return 'GESTIÓN EVENTO BIAN';
        return 'GESTIÓN EVENTO BLU 2.0';
      }
      if (tipo.startsWith('incidente-')) return 'GESTIÓN INCIDENTE';
      if (tipo.startsWith('mantenimiento-')) return tipo.includes('inicio') ? '⚠️ MANTENIMIENTO' : '✅ MANTENIMIENTO';
    };
    
    if (tipo === 'evento-inicio') {
      const descripcionVal = formData.descripcion || (modoBLU ? "Alertamiento [cluster/namespace]" : "DESCRIPCION DEL INCIDENTE");
      const estadoVal = formData.estadoInicio || "En revisión";
      const fechaFormateada = formatearFecha(formData.fechaInicio);
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🟡 ${estadoVal}\n\nDescripción: ${descripcionVal}\n${impactoFormateado}`;
      
      // Agregar escalado si existe
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      mensaje += `\nInicio: ${fechaFormateada} - ${formData.horaInicio}`;
    }
    else if (tipo === 'evento-seguimiento') {
      const descripcionVal = formData.descripcion || (modoBLU ? "Alertamiento [cluster/namespace]" : "DESCRIPCION DEL INCIDENTE");
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🔁 Seguimiento\n\nDescripción: ${descripcionVal}`;
      mensaje += `\n${impactoFormateado}`;
      
      // Agregar escalado si existe
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      if (formData.acciones && formData.acciones.trim()) {
        mensaje += "\nAcciones:";
        formData.acciones.split('\n').forEach(linea => {
          const lineaLimpia = linea.trim();
          if (lineaLimpia) {
            if (lineaLimpia.includes('%%')) {
              const [accion, responsable] = lineaLimpia.split('%%').map(s => s.trim());
              mensaje += `\n        • ${accion}`;
              if (responsable) mensaje += `\n          Responsable: ${responsable}`;
            } else {
              mensaje += `\n        • ${lineaLimpia}`;
            }
          }
        });
      }
    }
    else if (tipo === 'evento-fin') {
      const descripcionVal = formData.descripcion || (modoBLU ? "Alertamiento [cluster/namespace]" : "DESCRIPCION DEL INCIDENTE");
      const estadoVal = formData.estadoFin || "Recuperado";
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🟢 ${estadoVal}\n\nDescripción: ${descripcionVal}\n${impactoFormateado}`;
      
      // Agregar escalado si existe
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      mensaje += `\n${formatearPeriodosMultiples()}`;
      
      if (formData.acciones && formData.acciones.trim()) {
        mensaje += "\nAcciones:";
        formData.acciones.split('\n').forEach(linea => {
          const lineaLimpia = linea.trim();
          if (lineaLimpia) {
            if (lineaLimpia.includes('%%')) {
              const [accion, responsable] = lineaLimpia.split('%%').map(s => s.trim());
              mensaje += `\n        • ${accion}`;
              if (responsable) mensaje += `\n          Responsable: ${responsable}`;
            } else {
              mensaje += `\n        • ${lineaLimpia}`;
            }
          }
        });
      }
    }
    else if (tipo === 'mantenimiento-inicio') {
      const motivoVal = formData.motivo || "Descripción del Mantenimiento";
      const ejecutorVal = formData.ejecutor || "Proveedor o área interna";
      const estadoVal = formData.estadoInicio || "En curso";
      const fechaFormateada = formatearFecha(formData.fechaInicio);
      const impactoFormateado = formatearImpacto(formData.impactoMant, "Impacto servicio / usuarios / clientes");
      
      mensaje = `${getTitulo()}\n\nEstado: ${estadoVal}\nMotivo: ${motivoVal}\n${impactoFormateado}\nEjecutor: ${ejecutorVal}\nInicio: ${fechaFormateada} - ${formData.horaInicio}`;
    }
    else if (tipo === 'mantenimiento-fin') {
      const motivoVal = formData.motivo || "Descripción del Mantenimiento";
      const ejecutorVal = formData.ejecutor || "Proveedor o área interna";
      const estadoVal = formData.estadoFin || "Finalizado";
      const impactoFormateado = formatearImpacto(formData.impactoMant, "Impacto servicio / usuarios / clientes");
      
      mensaje = `${getTitulo()}\n\nEstado: ${estadoVal}\nMotivo: ${motivoVal}\n${impactoFormateado}\nEjecutor: ${ejecutorVal}\n${formatearPeriodosMultiples()}`;
    }
    else if (tipo === 'incidente-inicio') {
      const descripcionVal = formData.descripcion || "DESCRIPCION DEL INCIDENTE";
      const estadoVal = formData.estadoInicio || "En revisión";
      const fechaFormateada = formatearFecha(formData.fechaInicio);
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🟡 ${estadoVal}\n\nDescripción: ${descripcionVal}\n${impactoFormateado}`;
      
      // Agregar escalado si existe
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      mensaje += `\nInicio: ${fechaFormateada} - ${formData.horaInicio}`;
    }
    else if (tipo === 'incidente-avance') {
      const descripcionVal = formData.descripcion || "DESCRIPCION DEL INCIDENTE";
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🔁 Avance\n\nDescripción: ${descripcionVal}\n${impactoFormateado}`;
      
      // Agregar escalado si existe
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      if (formData.accionesEnCurso && formData.accionesEnCurso.trim()) {
        mensaje += "\nAcciones en curso:";
        formData.accionesEnCurso.split('\n').forEach(linea => {
          const lineaLimpia = linea.trim();
          if (lineaLimpia) {
            if (lineaLimpia.includes('%%')) {
              const [accion, responsable] = lineaLimpia.split('%%').map(s => s.trim());
              mensaje += `\n        • ${accion}`;
              if (responsable) mensaje += `\n          Responsable: ${responsable}`;
            } else {
              mensaje += `\n        • ${lineaLimpia}`;
            }
          }
        });
      }
      
      if (formData.accionesEjecutadas && formData.accionesEjecutadas.trim()) {
        mensaje += "\nAcciones ejecutadas:";
        formData.accionesEjecutadas.split('\n').forEach(linea => {
          const lineaLimpia = linea.trim();
          if (lineaLimpia) {
            if (lineaLimpia.includes('%%')) {
              const [accion, responsable] = lineaLimpia.split('%%').map(s => s.trim());
              mensaje += `\n        • ${accion}`;
              if (responsable) mensaje += `\n          Responsable: ${responsable}`;
            } else {
              mensaje += `\n        • ${lineaLimpia}`;
            }
          }
        });
      }
    }
    else if (tipo === 'incidente-fin') {
      const descripcionVal = formData.descripcion || "DESCRIPCION DEL INCIDENTE";
      const estadoFin = 'Recuperado';
      const impactoFormateado = formatearImpacto(formData.impacto, "Impacto servicio / usuarios");
      
      mensaje = `${getTitulo()}\n🟢 ${estadoFin}\n\nDescripción: ${descripcionVal}\n${impactoFormateado}`;
      
      // Agregar escalado si existe
      if (formData.escaladoA && formData.escaladoA.trim() !== '') {
        mensaje += `\nEscalado a: ${formData.escaladoA}`;
      }
      
      mensaje += `\n${formatearPeriodosMultiples()}`;
      
      if (formData.accionesEjecutadas && formData.accionesEjecutadas.trim()) {
        mensaje += "\nAcciones ejecutadas:";
        formData.accionesEjecutadas.split('\n').forEach(linea => {
          const lineaLimpia = linea.trim();
          if (lineaLimpia) {
            if (lineaLimpia.includes('%%')) {
              const [accion, responsable] = lineaLimpia.split('%%').map(s => s.trim());
              mensaje += `\n        • ${accion}`;
              if (responsable) mensaje += `\n          Responsable: ${responsable}`;
            } else {
              mensaje += `\n        • ${lineaLimpia}`;
            }
          }
        });
      }
    }
    
    if (formData.nota || (multiplesEncolamientos && tipo.startsWith('evento-'))) {
      if (tipo.startsWith('mantenimiento-')) {
        mensaje += `\n\n📣 NOTA:\n        ${formData.nota || 'Observaciones adicionales'}`;
      } else {
        mensaje += `\n\n📣 NOTA:`;
        if (formData.nota && formData.nota.trim() !== "") {
          mensaje += `\n        ${formData.nota}`;
        }
        if (multiplesEncolamientos && tipo.startsWith('evento-')) {
          const notaEncolamientos = formatearNotaEncolamientos();
          if (notaEncolamientos) {
            if (formData.nota && formData.nota.trim() !== "") {
              mensaje += `\n        \n        ${notaEncolamientos}`;
            } else {
              mensaje += `\n        ${notaEncolamientos}`;
            }
          }
        }
        if (!formData.nota && !multiplesEncolamientos) {
          mensaje = mensaje.replace('\n\n📣 NOTA:', '');
        }
      }
    }
    
    setResultado(mensaje);
    setMostrarAlerta(false);
    
    // Auto-limpiar el campo escaladoA si la opción está activa
    if (autoLimpiarEscalado && (tipo.startsWith('evento-') || tipo.startsWith('incidente-'))) {
      setFormData(prev => ({ ...prev, escaladoA: '' }));
    }
  };

  const copiar = () => {
    if (!resultado) {
      alert("[ERROR] MENSAJE_NO_GENERADO");
      return;
    }
    navigator.clipboard.writeText(resultado)
      .then(() => {
        setAlertaMensaje('[COPIADO_EXITOSO]');
        setMostrarAlerta(true);
        setTimeout(() => setMostrarAlerta(false), 3000);
      })
      .catch(() => {
        alert("[ERROR] FALLO_AL_COPIAR");
      });
  };

  // Estilos Matrix mejorados con transparencias
  const btnPrimary = "bg-gradient-to-r from-green-900/80 to-green-800/80 hover:from-green-800/90 hover:to-green-700/90 backdrop-blur border border-green-500 text-green-400 px-4 py-2 rounded font-mono transition-all shadow-lg shadow-green-900/50 hover:shadow-green-500/50 transform hover:scale-105";
  const btnSecondary = "bg-black/60 hover:bg-gray-900/70 backdrop-blur border border-green-600 text-green-500 px-4 py-2 rounded font-mono transition-all transform hover:scale-105";
  const input = "w-full p-3 bg-black/60 backdrop-blur border border-green-700 rounded text-green-400 placeholder-green-800/70 focus:border-green-500 focus:outline-none focus:shadow-lg focus:shadow-green-900/50 font-mono transition-all";
  const label = "block mb-2 text-xs font-mono text-green-500 uppercase tracking-wider";
  const card = "bg-black/60 backdrop-blur-md rounded-lg p-6 border border-green-800/50 shadow-xl shadow-green-900/30 hover:shadow-green-900/50 transition-all";

  // Login con efectos mejorados
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
        <MatrixRain />
        {/* Efecto de escaneo */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="h-1 bg-gradient-to-r from-transparent via-green-500 to-transparent opacity-50 animate-pulse"></div>
        </div>
        <div className="w-full max-w-md bg-black/70 backdrop-blur-lg rounded-lg p-8 border border-green-500/50 shadow-2xl shadow-green-500/30 relative z-10 transform hover:scale-105 transition-all">
          {/* Decoración de esquinas */}
          <div className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-green-500"></div>
          <div className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-green-500"></div>
          <div className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-green-500"></div>
          <div className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-green-500"></div>
          
          <div className="text-center mb-8">
            <div className="text-5xl mb-3 animate-pulse">☠️</div>
            <div className="flex justify-center space-x-2 mb-4">
              <span className="text-green-500 text-xs font-mono animate-pulse">01010011</span>
              <Terminal className="w-16 h-16 text-green-500 animate-pulse" />
              <span className="text-green-500 text-xs font-mono animate-pulse">11010001</span>
            </div>
            <h1 className="text-2xl font-mono font-bold text-green-400 mb-2 glitch" data-text="ACCESO AL SISTEMA">
              💀 ACCESO AL SISTEMA 💀
            </h1>
            <p className="text-green-600 text-xs font-mono">[GENERADOR_INCIDENTES_v5.0]</p>
            <p className="text-green-700 text-xs font-mono mt-1">⚡ [PROTOCOLO_MATRIX_ACTIVADO] ⚡</p>
            <div className="text-xs text-red-500 mt-2 font-mono animate-pulse">
              ⚠️ ACCESO_RESTRINGIDO ⚠️
            </div>
            <div className="mt-2 text-xs text-green-800 font-mono">
              01001000 01000001 01000011 01001011 01000101 01010010
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <label className={label}>🔓 ID_USUARIO:</label>
              <input
                type="text"
                name="usuario"
                value={loginForm.usuario}
                onChange={handleLoginInputChange}
                className={input}
                placeholder="Ingrese usuario..."
              />
            </div>
            <div>
              <label className={label}>🔐 CONTRASEÑA:</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={loginForm.password}
                  onChange={handleLoginInputChange}
                  className={input}
                  placeholder="Ingrese contraseña..."
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-600 hover:text-green-400"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>
            {loginError && (
              <div className="p-3 rounded bg-red-900/30 backdrop-blur border border-red-500">
                <p className="text-red-400 text-xs font-mono animate-pulse">⚠️ {loginError} ⚠️</p>
              </div>
            )}
            <button onClick={handleLogin} className="w-full bg-gradient-to-r from-green-900/80 to-green-800/80 hover:from-green-800/90 hover:to-green-700/90 backdrop-blur border border-green-500 text-green-400 py-3 rounded font-mono transition-all shadow-lg shadow-green-900/50 hover:shadow-green-500/50 transform hover:scale-105">
              ⚡ [INICIAR_CONEXIÓN] ⚡
            </button>
            <div className="text-center text-xs text-green-700 font-mono mt-4">
              ════════[ SISTEMA_SEGURO ]════════
            </div>
            <div className="text-center text-xs text-green-900 font-mono">
              10110101 00101110 11001010
            </div>
          </div>
        </div>
      </div>
    );
  }

  // App principal
  return (
    <div className="min-h-screen bg-black text-green-400 relative overflow-x-hidden">
      <MatrixRain />
      <div className="max-w-7xl mx-auto px-4 py-6 relative z-10">
        <header className="bg-gradient-to-b from-black/90 to-green-900/20 backdrop-blur-lg p-6 rounded-lg mb-6 border border-green-500/50 shadow-2xl shadow-green-500/20 relative overflow-hidden">
          {/* Efecto de escaneo animado */}
          <div className="absolute inset-0 opacity-20">
            <div className="absolute inset-0 bg-gradient-to-b from-green-500/20 to-transparent animate-pulse"></div>
          </div>
          
          <div className="absolute top-4 left-4 bg-black/80 backdrop-blur rounded p-2 text-xs font-mono border border-green-700/50">
            <span className={getEstadoSemaforo().clase}>{getEstadoSemaforo().color} {calcularTiempoAbierto().horas}h:{calcularTiempoAbierto().minutos}m</span>
            <button onClick={actualizarFechasAhora} className="ml-2 text-green-400 hover:text-green-300 transition-all">
              <RefreshCw className="w-3 h-3 inline" />
            </button>
          </div>
          <button onClick={handleLogout} className="absolute top-4 right-4 text-green-600 hover:text-green-400 text-xs font-mono transition-all">
            💀 [CERRAR_SESIÓN]
          </button>
          <div className="text-center relative z-10">
            <div className="flex justify-center items-center space-x-4 mb-3">
              <span className="text-green-800 text-2xl animate-pulse">01</span>
              <div className="text-4xl animate-bounce">☠️</div>
              <Terminal className="w-12 h-12 text-green-500 animate-pulse" />
              <div className="text-4xl animate-bounce">☠️</div>
              <span className="text-green-800 text-2xl animate-pulse">10</span>
            </div>
            <h1 className="text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600 mb-2 tracking-wider">
              <span className="text-red-500">⚡</span> SISTEMA_COMUNICADOS_INCIDENTES <span className="text-red-500">⚡</span>
            </h1>
            <p className="text-green-600 font-mono text-sm">[PROTOCOLO_MONITOREO_ACTIVO] 🔥</p>
            <div className="text-xs text-green-700 mt-1 font-mono">
              ════════════[ ACCESO_NIVEL_5 ]════════════
            </div>
            <div className="text-xs text-green-900 font-mono mt-1">
              01001101 01000001 01010100 01010010 01001001 01011000
            </div>
            <button
              onClick={() => setModoBLU(!modoBLU)}
              className={`mt-3 px-4 py-2 rounded text-xs font-mono border transition-all transform hover:scale-105 ${
                modoBLU 
                  ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 backdrop-blur border-blue-500 text-blue-400 shadow-lg shadow-blue-500/30' 
                  : 'bg-black/60 backdrop-blur border-green-800 text-green-600'
              }`}
            >
              {modoBLU ? '💙 [BLU_2.0_ACTIVO]' : '⚪ [ACTIVAR_BLU_2.0]'}
            </button>
            {modoBLU && (
              <div className="mt-3 inline-flex gap-2">
                {['aplicacion', 'infraestructura', 'bian'].map(t => (
                  <button
                    key={t}
                    onClick={() => setTipoBLU(t)}
                    className={`px-3 py-1 rounded text-xs font-mono border transition-all transform hover:scale-105 ${
                      tipoBLU === t 
                        ? 'bg-gradient-to-r from-blue-900/50 to-blue-800/50 backdrop-blur border-blue-500 text-blue-400' 
                        : 'bg-black/60 backdrop-blur border-green-800 text-green-600'
                    }`}
                  >
                    {t === 'aplicacion' ? '📱 [APP]' : t === 'infraestructura' ? '🖥️ [INFRA]' : '⚠️ [BIAN]'}
                  </button>
                ))}
              </div>
            )}
          </div>
        </header>
        
        <div className="grid lg:grid-cols-4 gap-6">
          {/* Panel lateral izquierdo */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              <div className={card}>
                <h2 className="text-sm font-mono font-bold text-green-400 mb-4 tracking-wider">
                  <span className="text-red-500">▼</span> [TIPO_COMUNICADO] <span className="text-red-500">▼</span>
                </h2>
                <div className="space-y-3">
                  <div className="border border-green-700 rounded p-3">
                    <h3 className="text-xs font-mono text-green-600 mb-2">⚡ [EVENTOS]</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {['evento-inicio', 'evento-seguimiento', 'evento-fin'].map((t, i) => (
                        <button
                          key={t}
                          className={`p-2 rounded text-xs font-mono border transition-all ${tipo === t ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-black border-green-800 text-green-600'}`}
                          onClick={() => seleccionarTipo(t)}
                        >
                          {i === 0 ? '🟡' : i === 1 ? '🔁' : '🟢'}<br/>{i === 0 ? 'INICIO' : i === 1 ? 'SEG' : 'FIN'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border border-green-700 rounded p-3">
                    <h3 className="text-xs font-mono text-green-600 mb-2">🔧 [MANTENIMIENTOS]</h3>
                    <div className="grid grid-cols-2 gap-2">
                      {['mantenimiento-inicio', 'mantenimiento-fin'].map((t, i) => (
                        <button
                          key={t}
                          className={`p-2 rounded text-xs font-mono border transition-all ${tipo === t ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-black border-green-800 text-green-600'}`}
                          onClick={() => seleccionarTipo(t)}
                        >
                          {i === 0 ? '⚠️' : '✅'}<br/>{i === 0 ? 'INICIO' : 'FIN'}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="border border-green-700 rounded p-3">
                    <h3 className="text-xs font-mono text-green-600 mb-2">💀 [INCIDENTES]</h3>
                    <div className="grid grid-cols-3 gap-2">
                      {['incidente-inicio', 'incidente-avance', 'incidente-fin'].map((t, i) => (
                        <button
                          key={t}
                          className={`p-2 rounded text-xs font-mono border transition-all ${tipo === t ? 'bg-green-900/50 border-green-500 text-green-400' : 'bg-black border-green-800 text-green-600'}`}
                          onClick={() => seleccionarTipo(t)}
                        >
                          {i === 0 ? '🟡' : i === 1 ? '🔁' : '🟢'}<br/>{i === 0 ? 'INICIO' : i === 1 ? 'AVANCE' : 'FIN'}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className={card}>
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-xs font-mono font-bold text-green-400 tracking-wider">🎯 [SERVICIOS_TX]</h2>
                  <button onClick={() => setMostrarServicios(!mostrarServicios)} className="text-green-600 hover:text-green-400 transition-all transform hover:scale-110">
                    {mostrarServicios ? <Minus className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  </button>
                </div>
                {mostrarServicios && (
                  <div className="space-y-2 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-green-800 scrollbar-track-black">
                    <button onClick={limpiarImpactos} className="text-xs bg-gradient-to-r from-red-900/60 to-red-800/60 backdrop-blur border border-red-700 hover:border-red-500 text-red-400 px-2 py-1 rounded font-mono transform hover:scale-105 transition-all">
                      <Trash2 className="w-3 h-3 inline mr-1" />🔥 [LIMPIAR]
                    </button>
                    
                    <div className="border border-green-800/50 rounded p-2 bg-black/40 backdrop-blur">
                      <h4 className="text-xs font-mono text-green-600 mb-1">💳 [DATAFAST]</h4>
                      <div className="space-y-1">
                        {SERVICIOS_TRANSACCIONALES.filter(s => s.categoria === 'datafast').map(servicio => (
                          <button
                            key={servicio.id}
                            onClick={() => seleccionarServicio(servicio)}
                            className="text-left w-full text-xs bg-gradient-to-r from-black/60 to-green-900/20 backdrop-blur border border-green-900 hover:border-green-500 hover:from-green-900/40 hover:to-green-800/40 text-green-400 p-1.5 rounded truncate font-mono transform hover:scale-105 transition-all"
                            title={servicio.descripcion}
                          >
                            {servicio.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border border-green-800/50 rounded p-2 bg-black/40 backdrop-blur">
                      <h4 className="text-xs font-mono text-green-600 mb-1">🏦 [BANRED]</h4>
                      <div className="space-y-1">
                        {SERVICIOS_TRANSACCIONALES.filter(s => s.categoria === 'banred').map(servicio => (
                          <button
                            key={servicio.id}
                            onClick={() => seleccionarServicio(servicio)}
                            className="text-left w-full text-xs bg-gradient-to-r from-black/60 to-green-900/20 backdrop-blur border border-green-900 hover:border-green-500 hover:from-green-900/40 hover:to-green-800/40 text-green-400 p-1.5 rounded truncate font-mono transform hover:scale-105 transition-all"
                            title={servicio.descripcion}
                          >
                            {servicio.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border border-green-800/50 rounded p-2 bg-black/40 backdrop-blur">
                      <h4 className="text-xs font-mono text-green-600 mb-1">🌍 [INTERNACIONAL]</h4>
                      <div className="space-y-1">
                        {SERVICIOS_TRANSACCIONALES.filter(s => s.categoria === 'internacional').map(servicio => (
                          <button
                            key={servicio.id}
                            onClick={() => seleccionarServicio(servicio)}
                            className="text-left w-full text-xs bg-gradient-to-r from-black/60 to-green-900/20 backdrop-blur border border-green-900 hover:border-green-500 hover:from-green-900/40 hover:to-green-800/40 text-green-400 p-1.5 rounded truncate font-mono transform hover:scale-105 transition-all"
                            title={servicio.descripcion}
                          >
                            {servicio.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="border border-green-800/50 rounded p-2 bg-black/40 backdrop-blur">
                      <h4 className="text-xs font-mono text-green-600 mb-1">🔧 [OTROS_SERVICIOS]</h4>
                      <div className="space-y-1">
                        {SERVICIOS_TRANSACCIONALES.filter(s => !['datafast', 'banred', 'internacional'].includes(s.categoria)).map(servicio => (
                          <button
                            key={servicio.id}
                            onClick={() => seleccionarServicio(servicio)}
                            className="text-left w-full text-xs bg-gradient-to-r from-black/60 to-green-900/20 backdrop-blur border border-green-900 hover:border-green-500 hover:from-green-900/40 hover:to-green-800/40 text-green-400 p-1.5 rounded truncate font-mono transform hover:scale-105 transition-all"
                            title={servicio.descripcion}
                          >
                            {servicio.nombre}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Panel principal derecho */}
          <div className="lg:col-span-3 space-y-6">
            <div className={card}>
              <h2 className="text-lg font-mono font-bold text-green-400 mb-4 tracking-wider">[CONFIGURACIÓN_MENSAJE]</h2>

              {/* Panel de escalamiento BLU */}
              {modoBLU && tipo.startsWith('evento-') && (
                <div className={`p-3 rounded mb-4 border ${
                  tipoBLU === 'bian' ? 'bg-orange-900/20 border-orange-500' :
                  tipoBLU === 'infraestructura' ? 'bg-purple-900/20 border-purple-500' :
                  'bg-blue-900/20 border-blue-500'
                }`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-mono text-green-600 mb-1">[DESTINO_ESCALAMIENTO]:</p>
                      <p className="text-sm font-mono font-medium text-green-400">
                        {tipoBLU === 'bian' 
                          ? 'Miguel Angel López Garavito'
                          : tipoBLU === 'infraestructura'
                          ? 'Infraestructura Cloud'
                          : 'Paul Chamorro / David Albuja'}
                      </p>
                      {tipoBLU === 'bian' && (
                        <p className="text-xs font-mono text-green-700 mt-1">[MAIL]: malopez@dinersclub.com.ec</p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Campos para eventos e incidentes */}
              {(tipo.startsWith('evento-') || tipo.startsWith('incidente-')) && (
                <div className="space-y-4">
                  <div>
                    <label className={label}>
                      [DESCRIPCIÓN]:
                      {modoBLU && (
                        <span className="text-xs ml-2 text-blue-400">
                          (Formato: Alerta [namespace/cluster])
                        </span>
                      )}
                    </label>
                    <input 
                      className={input}
                      type="text" 
                      name="descripcion"
                      placeholder={modoBLU ? "Alerta CLUSTER_EKS_KB" : "Descripción del incidente"}
                      value={formData.descripcion}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className={label}>[IMPACTO]:</label>
                    <textarea 
                      className={input + " h-24 resize-y font-mono"}
                      name="impacto"
                      placeholder="Impacto servicio/usuarios"
                      value={formData.impacto}
                      onChange={handleInputChange}
                    />
                  </div>
                  
                  <div>
                    <label className={label}>
                      <span className="mr-2">💀</span>[ESCALADO_A] (opcional):
                    </label>
                    {ultimoEscalado && (
                      <div className="text-xs text-yellow-500 mb-2 font-mono border border-yellow-900 bg-yellow-900/20 p-2 rounded">
                        ⚠️ Último escalamiento: {ultimoEscalado}
                      </div>
                    )}
                    <input
                      type="text"
                      name="escaladoA"
                      placeholder="Nombre de la persona o equipo al que se escaló..."
                      value={formData.escaladoA}
                      onChange={handleInputChange}
                      className={input}
                    />
                    <label className="flex items-center space-x-2 cursor-pointer mt-2">
                      <input
                        type="checkbox"
                        checked={autoLimpiarEscalado}
                        onChange={(e) => setAutoLimpiarEscalado(e.target.checked)}
                        className="w-4 h-4 text-green-600 bg-black border-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-xs font-mono text-green-500">
                        [AUTO_LIMPIAR] <span className="text-green-600">- Limpia este campo después de generar</span>
                      </span>
                    </label>
                  </div>
                </div>
              )}
              
              {/* Campos para mantenimientos */}
              {tipo.startsWith('mantenimiento-') && (
                <div className="space-y-4">
                  <div>
                    <label className={label}>[MOTIVO]:</label>
                    <input 
                      className={input}
                      type="text" 
                      name="motivo"
                      placeholder="Descripción del mantenimiento"
                      value={formData.motivo}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={label}>[IMPACTO]:</label>
                    <textarea 
                      className={input + " h-24 resize-y font-mono"}
                      name="impactoMant"
                      placeholder="Impacto servicio/usuarios/clientes"
                      value={formData.impactoMant}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={label}>[EJECUTOR]:</label>
                    <input 
                      className={input}
                      type="text" 
                      name="ejecutor"
                      placeholder="Proveedor o área interna"
                      value={formData.ejecutor}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
              
              {/* Continúa en la siguiente parte */}
              
              {/* Múltiples encolamientos para eventos */}
              {(tipo === 'evento-inicio' || tipo === 'evento-seguimiento') && (
                <div className="mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={multiplesEncolamientos}
                      onChange={(e) => setMultiplesEncolamientos(e.target.checked)}
                      className="w-4 h-4 text-green-600 bg-black border-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-xs font-mono text-green-500">[ENCOLAMIENTO_MÚLTIPLE]</span>
                  </label>
                  
                  {multiplesEncolamientos && (
                    <div className="mt-4 space-y-3">
                      <div className="flex justify-between">
                        <h3 className="text-xs font-mono text-green-500">[SERVICIOS_ENCOLADOS]</h3>
                        <button onClick={agregarServicioEncolamiento} className="text-xs bg-green-900/50 hover:bg-green-800/50 border border-green-500 text-green-400 px-3 py-1 rounded font-mono">
                          [AGREGAR]
                        </button>
                      </div>
                      {serviciosEncolamiento.map((servicio, index) => (
                        <div key={index} className="bg-black rounded p-4 border border-green-800">
                          <div className="flex justify-between mb-3">
                            <span className="text-xs font-mono text-green-500">[SERVICIO_{index + 1}]</span>
                            {serviciosEncolamiento.length > 1 && (
                              <button onClick={() => eliminarServicioEncolamiento(index)} className="text-red-400 hover:text-red-300">
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <div className="col-span-2">
                              <select
                                value={servicio.tipo}
                                onChange={(e) => actualizarServicioEncolamiento(index, 'tipo', e.target.value)}
                                className="w-full p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono"
                              >
                                {OPCIONES_ENCOLAMIENTO.map(opcion => (
                                  <option key={opcion} value={opcion}>{opcion}</option>
                                ))}
                                <option value="Otro">Otro (especificar)</option>
                              </select>
                              {servicio.tipo === 'Otro' && (
                                <input
                                  type="text"
                                  placeholder="Especifica el tipo de servicio"
                                  value={servicio.tipoCustom}
                                  onChange={(e) => actualizarServicioEncolamiento(index, 'tipoCustom', e.target.value)}
                                  className="w-full mt-2 p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono"
                                />
                              )}
                            </div>
                            <input 
                              type="number"
                              placeholder="Cantidad"
                              value={servicio.encolados}
                              onChange={(e) => actualizarServicioEncolamiento(index, 'encolados', e.target.value)}
                              className="p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono col-span-2"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              
              {/* Fechas para inicio */}
              {(tipo.endsWith('-inicio')) && (
                <div className="space-y-4 mt-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={label}>[FECHA_INICIO]:</label>
                      <input 
                        className={input}
                        type="date" 
                        name="fechaInicio"
                        value={formData.fechaInicio}
                        onChange={handleInputChange}
                      />
                    </div>
                    <div>
                      <label className={label}>[HORA_INICIO]:</label>
                      <input 
                        className={input}
                        type="time" 
                        step="1"
                        name="horaInicio"
                        value={formData.horaInicio}
                        onChange={handleInputChange}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Acciones para seguimiento */}
              {tipo === 'evento-seguimiento' && (
                <div className="mt-4">
                  <label className={label}>[ACCIONES]:</label>
                  <textarea 
                    className={input + " h-32 resize-y font-mono"}
                    placeholder="Acción %% Responsable (opcional)"
                    name="acciones"
                    value={formData.acciones}
                    onChange={handleInputChange}
                  />
                </div>
              )}
              
              {/* Acciones para incidente avance */}
              {tipo === 'incidente-avance' && (
                <div className="space-y-4 mt-4">
                  <div>
                    <label className={label}>[ACCIONES_EN_CURSO]:</label>
                    <textarea 
                      className={input + " h-24 resize-y font-mono"}
                      placeholder="Acción %% Responsable"
                      name="accionesEnCurso"
                      value={formData.accionesEnCurso}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div>
                    <label className={label}>[ACCIONES_EJECUTADAS]:</label>
                    <textarea 
                      className={input + " h-24 resize-y font-mono"}
                      placeholder="Acción %% Responsable"
                      name="accionesEjecutadas"
                      value={formData.accionesEjecutadas}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
              )}
              
              {/* Campos para fin */}
              {tipo.endsWith('-fin') && (
                <div className="space-y-4 mt-4">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={multiplesAlertamientos}
                      onChange={(e) => setMultiplesAlertamientos(e.target.checked)}
                      className="w-4 h-4 text-green-600 bg-black border-green-600 rounded focus:ring-green-500"
                    />
                    <span className="text-xs font-mono text-green-500">[PERIODOS_ALERTA_MÚLTIPLES]</span>
                  </label>

                  {tipo.startsWith('evento-') && (
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={multiplesEncolamientos}
                        onChange={(e) => setMultiplesEncolamientos(e.target.checked)}
                        className="w-4 h-4 text-green-600 bg-black border-green-600 rounded focus:ring-green-500"
                      />
                      <span className="text-xs font-mono text-green-500">[ENCOLAMIENTO_MÚLTIPLE]</span>
                    </label>
                  )}

                  {multiplesEncolamientos ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <h3 className="text-xs font-mono text-green-500">[SERVICIOS_ENCOLADOS]</h3>
                        <button onClick={agregarServicioEncolamiento} className="text-xs bg-green-900/50 hover:bg-green-800/50 border border-green-500 text-green-400 px-3 py-1 rounded font-mono">
                          [AGREGAR]
                        </button>
                      </div>
                      {serviciosEncolamiento.map((servicio, index) => (
                        <div key={index} className="bg-black rounded p-4 border border-green-800">
                          <div className="flex justify-between mb-3">
                            <span className="text-xs font-mono text-green-500">[SERVICIO_{index + 1}]</span>
                            {serviciosEncolamiento.length > 1 && (
                              <button onClick={() => eliminarServicioEncolamiento(index)} className="text-red-400 hover:text-red-300">
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={servicio.tipo}
                              onChange={(e) => actualizarServicioEncolamiento(index, 'tipo', e.target.value)}
                              className="col-span-2 p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono"
                            >
                              {OPCIONES_ENCOLAMIENTO.map(opcion => (
                                <option key={opcion} value={opcion}>{opcion}</option>
                              ))}
                              <option value="Otro">Otro (especificar)</option>
                            </select>
                            {servicio.tipo === 'Otro' && (
                              <input
                                type="text"
                                placeholder="Especifica el tipo de servicio"
                                value={servicio.tipoCustom}
                                onChange={(e) => actualizarServicioEncolamiento(index, 'tipoCustom', e.target.value)}
                                className="col-span-2 p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono"
                              />
                            )}
                            <input type="date" value={servicio.fechaInicio} onChange={(e) => actualizarServicioEncolamiento(index, 'fechaInicio', e.target.value)} className="p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono" />
                            <input type="time" step="1" value={servicio.horaInicio} onChange={(e) => actualizarServicioEncolamiento(index, 'horaInicio', e.target.value)} className="p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono" />
                            <input type="date" value={servicio.fechaFin} onChange={(e) => actualizarServicioEncolamiento(index, 'fechaFin', e.target.value)} className="p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono" />
                            <input type="time" step="1" value={servicio.horaFin} onChange={(e) => actualizarServicioEncolamiento(index, 'horaFin', e.target.value)} className="p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono" />
                            <input type="number" placeholder="Cantidad" value={servicio.encolados} onChange={(e) => actualizarServicioEncolamiento(index, 'encolados', e.target.value)} className="col-span-2 p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono" />
                            <div className="col-span-2 text-center text-green-400 text-xs font-mono">[DURACIÓN]: {servicio.duracion}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}

                  {(multiplesAlertamientos && !multiplesEncolamientos) ? (
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <h3 className="text-xs font-mono text-green-500">[PERIODOS_ALERTAMIENTO]</h3>
                        <button onClick={agregarPeriodo} className="text-xs bg-green-900/50 hover:bg-green-800/50 border border-green-500 text-green-400 px-3 py-1 rounded font-mono">
                          [AGREGAR]
                        </button>
                      </div>
                      {periodosAlertamiento.map((periodo, index) => (
                        <div key={index} className="bg-black rounded p-4 border border-green-800">
                          <div className="flex justify-between mb-3">
                            <span className="text-xs font-mono text-green-500">[PERIODO_{index + 1}]</span>
                            {periodosAlertamiento.length > 1 && (
                              <button onClick={() => eliminarPeriodo(index)} className="text-red-400 hover:text-red-300">
                                <Minus className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-2 gap-3">
                            <input type="date" value={periodo.fechaInicio} onChange={(e) => actualizarPeriodo(index, 'fechaInicio', e.target.value)} className="p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono" />
                            <input type="time" step="1" value={periodo.horaInicio} onChange={(e) => actualizarPeriodo(index, 'horaInicio', e.target.value)} className="p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono" />
                            <input type="date" value={periodo.fechaFin} onChange={(e) => actualizarPeriodo(index, 'fechaFin', e.target.value)} className="p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono" />
                            <input type="time" step="1" value={periodo.horaFin} onChange={(e) => actualizarPeriodo(index, 'horaFin', e.target.value)} className="p-2 bg-black border border-green-700 rounded text-green-400 text-xs font-mono" />
                            <div className="col-span-2 text-center text-green-400 text-xs font-mono">[DURACIÓN]: {periodo.duracion}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (!multiplesEncolamientos && (
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className={label}>[FECHA_INICIO]:</label>
                          <input className={errorFechaFin ? input + " border-red-500" : input} type="date" name="fechaInicioFin" value={formData.fechaInicioFin} onChange={handleInputChange} />
                        </div>
                        <div>
                          <label className={label}>[HORA_INICIO]:</label>
                          <input className={errorFechaFin ? input + " border-red-500" : input} type="time" step="1" name="horaInicioFin" value={formData.horaInicioFin} onChange={handleInputChange} />
                        </div>
                        <div>
                          <label className={label}>[FECHA_FIN]:</label>
                          <input className={errorFechaFin ? input + " border-red-500" : input} type="date" name="fechaFin" value={formData.fechaFin} onChange={handleInputChange} />
                          {errorFechaFin && (
                            <div className="mt-2 space-y-2">
                              <p className="text-red-400 text-xs font-mono">{errorFechaFin}</p>
                              {sugerenciasFecha.map((sug, i) => (
                                <button key={i} onClick={() => aplicarSugerenciaFecha(sug.fecha, sug.hora)} className="text-xs bg-green-900/50 hover:bg-green-800/50 border border-green-500 text-green-400 px-2 py-1 rounded font-mono">
                                  {sug.texto}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <label className={label}>[HORA_FIN]:</label>
                          <input className={errorFechaFin ? input + " border-red-500" : input} type="time" step="1" name="horaFin" value={formData.horaFin} onChange={handleInputChange} />
                        </div>
                      </div>
                      <div className="p-4 bg-black border border-green-700 rounded text-center">
                        <span className="text-2xl font-mono font-bold text-green-400">[{formData.duracionCalculada}]</span>
                      </div>
                    </div>
                  ))}
                  
                  {(tipo === 'evento-fin' || tipo === 'incidente-fin') && (
                    <div>
                      <label className={label}>[ACCIONES_EJECUTADAS]:</label>
                      <textarea 
                        className={input + " h-32 resize-y font-mono"}
                        placeholder="Acción %% Responsable"
                        name={tipo === 'evento-fin' ? 'acciones' : 'accionesEjecutadas'}
                        value={tipo === 'evento-fin' ? formData.acciones : formData.accionesEjecutadas}
                        onChange={handleInputChange}
                      />
                    </div>
                  )}
                </div>
              )}
              
              <div className="mt-4">
                <label className={label}>[NOTA_ADICIONAL] (opcional):</label>
                <textarea 
                  className={input + " h-20 resize-y font-mono"}
                  placeholder="Observaciones adicionales"
                  name="nota"
                  value={formData.nota}
                  onChange={handleInputChange}
                />
              </div>
              
              <button 
                className={`w-full mt-6 ${errorFechaFin ? 'bg-gray-900 cursor-not-allowed border-gray-700' : btnPrimary}`}
                onClick={generarMensaje}
                disabled={errorFechaFin && errorFechaFin.includes('ERROR')}
              >
                <Zap className="w-5 h-5 inline mr-2" />
                💀 [GENERAR_MENSAJE] 💀
              </button>
            </div>
            
            <div className={card}>
              <h2 className="text-lg font-mono font-bold text-green-400 mb-4 tracking-wider">
                ⚡ [SALIDA_MENSAJE] ⚡
              </h2>
              <div className="bg-black p-4 rounded font-mono text-xs min-h-[150px] border border-green-700">
                <pre className="whitespace-pre-wrap text-green-400">{resultado || '☠️ [ESPERANDO_GENERACIÓN]...'}</pre>
              </div>
              
              {mostrarAlerta && (
                <div className="mt-4 p-3 rounded bg-green-900/30 border border-green-500">
                  <p className="text-green-300 text-xs font-mono">⚡ {alertaMensaje}</p>
                </div>
              )}
              
              <div className="flex gap-4 mt-4">
                <button className={btnPrimary + " flex-1"} onClick={copiar}>
                  <Copy className="w-4 h-4 inline mr-2" />
                  📋 [COPIAR]
                </button>
                <button className={btnSecondary + " flex-1"} onClick={limpiarCampos}>
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  🔥 [LIMPIAR]
                </button>
              </div>
            </div>
          </div>
        </div>
        
        {/* Modales */}
        {mostrarActualizacion && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="bg-black border border-green-500 rounded-lg p-6 max-w-md mx-4 shadow-2xl shadow-green-500/30">
              <h3 className="text-lg font-mono font-bold text-green-400 mb-2">[SINCRONIZACIÓN_REQUERIDA]</h3>
              <p className="text-green-600 text-xs font-mono mb-4">
                [TIEMPO_SESIÓN]: {calcularTiempoAbierto().horas}h {calcularTiempoAbierto().minutos}m
              </p>
              <div className="flex gap-3">
                <button onClick={actualizarFechasAhora} className={btnPrimary + " flex-1"}>[SINCRONIZAR]</button>
                <button onClick={() => setMostrarActualizacion(false)} className={btnSecondary + " flex-1"}>[DESPUÉS]</button>
              </div>
              <button onClick={() => {setNoPreguntar(true); setMostrarActualizacion(false);}} className="w-full mt-2 text-xs text-green-700 hover:text-green-500 font-mono">
                [DESACTIVAR_RECORDATORIO]
              </button>
            </div>
          </div>
        )}

        {mostrarConfirmacionDuracion && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="bg-black border border-yellow-500 rounded-lg p-6 max-w-md mx-4 shadow-2xl shadow-yellow-500/30">
              <h3 className="text-xl font-mono font-bold text-yellow-400 mb-4">[ALERTA_DURACIÓN]</h3>
              <div className="bg-yellow-900/20 border border-yellow-800 rounded p-4 mb-4">
                <p className="text-green-400 mb-2 font-mono">
                  [DURACIÓN_CALCULADA]: <span className="font-bold text-yellow-400 text-xl">
                    {multiplesAlertamientos && periodosAlertamiento.length > 0 ? calcularDuracionTotal() : formData.duracionCalculada}
                  </span>
                </p>
                <p className="text-green-600 text-xs font-mono">
                  [VERIFICAR]: La duración excede el umbral de 4 horas
                </p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => {
                    setMostrarConfirmacionDuracion(false);
                    generarMensajeInterno();
                  }} 
                  className="flex-1 bg-green-900 hover:bg-green-800 border border-green-500 text-green-400 px-4 py-2 rounded font-mono transition-all"
                >
                  [CONFIRMAR]
                </button>
                <button 
                  onClick={() => setMostrarConfirmacionDuracion(false)} 
                  className="flex-1 bg-orange-900 hover:bg-orange-800 border border-orange-500 text-orange-400 px-4 py-2 rounded font-mono transition-all"
                >
                  [REVISAR]
                </button>
              </div>
            </div>
          </div>
        )}

        {mostrarErrorFecha && (
          <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
            <div className="bg-black border border-red-500 rounded-lg p-6 max-w-lg mx-4 shadow-2xl shadow-red-500/30">
              <h3 className="text-xl font-mono font-bold text-red-400 mb-3">[ERROR_FECHA]</h3>
              <div className="bg-red-900/30 border border-red-700 rounded p-3 mb-4">
                <p className="text-red-300 text-xs font-mono whitespace-pre-line">{errorFechaFin}</p>
              </div>
              {sugerenciasFecha.length > 0 && (
                <div className="space-y-2 mb-4">
                  <p className="text-xs font-mono text-green-600">[CORRECCIÓN_SUGERIDA]:</p>
                  {sugerenciasFecha.map((sug, i) => (
                    <button
                      key={i}
                      onClick={() => {aplicarSugerenciaFecha(sug.fecha, sug.hora); setMostrarErrorFecha(false);}}
                      className="w-full text-left bg-black border border-green-700 hover:border-green-500 text-green-400 p-3 rounded text-xs font-mono"
                    >
                      {sug.texto}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={() => setMostrarErrorFecha(false)} className={btnPrimary + " w-full"}>
                [ENTENDIDO]
              </button>
            </div>
          </div>
        )}
        
        <footer className="text-center py-6 mt-8 text-green-700 text-xs border-t border-green-900 font-mono">
          <div className="mb-2">
            ════════════════════════════════════════════════
          </div>
          <p>💀 [DESARROLLADOR]: Luis Alberto Herrera Lara 💀</p>
          <p>[VERSIÓN_SISTEMA]: COMM_INCIDENTES_v5.0_MATRIX_HACKER_EDITION</p>
          <div className="mt-2">
            <span className="text-red-500">⚡</span> [ACCESO_RESTRINGIDO] <span className="text-red-500">⚡</span>
          </div>
        </footer>
      </div>
    </div>
  );
}

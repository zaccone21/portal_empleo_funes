sept 17, 2026

# **Funes Tech Lab - Transcripción**

### **00:00:18**

**Diego Bussanich:** Ah. a Yo les voy pasando. Armamos una conductas tu teléfono. El micrófono. Con micrófono con esperemos acá. Así lo lo llamamos con las energías y que se que se siente ahí. Y la idea es cada uno, yo le voy pasando esto, lo usamos el micrófono, eh, y vamos haciendo la pregunta y el señor va a ir respondiendo. Le vamos a poner un micrófono también todo conectado con igual porque después empiezo a comercializar el que mejor postor el que recibe el tran. Así que bueno, eso un poco vinieron con creo que venían un ratito, eh, lo vamos a tener media hora, 40 minutos, así que hagamos que tenga ganas de irse a la media hora. Vamos a hacer muchas preguntas y viene Mario. Mario, preguntas difíciles, ¿no? Pregunta difícil, eh, así que bueno, nada, la idea es que anotemos todo. ¿Ustedes trajeron algunas preguntas? Ya anotaba, estudiaron. Lo tenemos a Luciano que se está sumando, que que nos tardó con el pobre y lo dejamos fuera. Así que nada, ahí lo sumé, te traté de darle la primer clase.

### **00:02:43**

**Diego Bussanich:** Lo que sirve tenemos que buscar equipo. Se armar el equipo Lucho la semana pasada de dos y un equipo de tres. El equipo de tres no tres. Eh, nosotros dos y una chica y un cariño si quieres Bárbaro, eh. Así que bueno, nada, ahí tendríamos que hacer sorteo donde cae Lucho con equipo o los papelitos todavía no tengo papelitos. Mira, va idea. A ver, no, no, no. Estoy con un tema de mudanza, todo. Me estoy comiendo de otro pueblo. Un papelito chiquito, no sé quién es. Ah. Hay dos papelitos es el de dos. Ah, bueno. Listo. Lucía. Lucía. Bueno, va. Mira para allá. Ahí está diciendo si venir con nosotros. Bueno, duda de la primer clase. Consulta. ¿Hicieron algo? los deberes. Bueno, yo estoy bueno ver que agarr si vos tenés un agente pago, está visto al estudio con tu agente pago y no usas antigravity.

### **00:04:34**

**Diego Bussanich:** Pero no hay que usar. ¿Alguna otra pregunta? Todos vieron lo que había que bajar el git, eh cómo trabajit el code todo. Sí, piensen que la próxima clases, las dos que viene, la semana que viene, van a ser virtual. Por consecuencia vamos a hacerla por Discord, eh, así que todos tienen que llenar la Excel que le dimos acceso para que carguen su usuario. Una vez que lo cargaron, ya la clase que viene virtual, después la otra semana volvemos a la presencialidad, vamos a ir iniciando y la virtud hacemos acá, ¿no? Sí, sí. Eso es importante que sepan que tienen que instalar, cómo va a llevar tiempo cosa y se van a topar con un montón de dudas y que haya dudas. Sí, sí, sí. Así que bueno, la idea de hoy es atacarlo cliente. Me quiero llevar hoy de la de la clase de hoy que nos llevemos lo que es el MVP que tenemos que armar el producto mínimo para cumplir con lo que necesitamos y tener claro lo que es de las 10 principales funciones que tenemos o eso sería el objetivo de hoy. Si logramos eso, ya después le vamos a dejar como tarea que que se hagan un backlock de todo, para analizarlo ya como la próxima semana para el tipo de desarrollo.

### **00:06:09**

**Diego Bussanich:** Así que bueno, eh hoy es clave para marcar un poco el ro de lo que hay que construir ya con el cliente. Me costó porque no podía leer, pero que venga. Eh, así podemos aprovechar este espacio. Una vez que hagamos las preguntas y demás, mi objetivo es tratar de llegar a armar los casos definir los MVP y la lista de requerimiento. Eh, todo eso después lo compartimos. Eh, y lo que las dudas que nos vayan quedando. En primera en la primera clase yo plante algunos problemas que que elente me comentó me comentó así para arriba. Hoy la idea es profundizar un poquito sobre eso. Bueno, piensen que vivirente no piensa como nosotros, sino que tenemos que tratar de ser objetivo a la hora de preguntar e de bueno, contarnos tu trabajo, qué hacemos con un CB con inglesa, qué hacen y cuándo eh entra una oferta de empleo, que sea todo muy genérica la pregunta para después nosotros la llevamos a algo más más tangible para hacerlo como sistema. Esa va a ser un poquito qué más. Eh, bueno, si no viene el cliente, eh, van a hacer el vamos a poner un actor. Estuvieron, buscaron portales de municipios parecidos.

### **00:07:42**

**Diego Bussanich:** ¿Qué encontraron? Sí, sí. Buenos Aires y Rosario. Ah, de Rosario. De Buenos Aires casi oferta. Bueno, eso viste como se piensan los proyectos que el otro día que se piensan desde una oficina o desde el encerrado de una computadora termina en no los sistemas. Eh, así que bueno, por eso es importante entender el concepto de lo que hay que armar, que se realmente agregue valor. Entonces, bueno, imagínense que nosotros alguien análogo lo vamos a llevar a software y por una idea que está buenísimo. Imagínese en el subsuelo de la que llevarlo a digitalizar. Digo, siempre digo lo mismo. Primero hacemos un número escrito en un cuaderno a por lo menos un número escrito y ya con eso es un y después seguir la etapa de evolución. Alguna idea que pudieron robar de algún lado y le llamó la atención en el de Rosario, la página de los muy interesante porque armas el CB ahí adentro, o sea, se ve ahí subir un CB. Claro, eso está bueno Porque ya sabes que todos los que son distintos. Eso es un buen punto y lo podemos tomar como como algo interesante. Te digo la contra de esto y que tenemos que tener gente que sepa gente ganas de mucho campo y toda la historia de eso se ve.

### **00:09:21**

**Diego Bussanich:** Habría que ver cómo hacemos ese puente para que sea más fácil, digamos. Pero sí es algo clave decir. Uno se ve de una manera, otra vez lo hace de otro, otro de otro, otro de otro, termina haciendo unaada rusa. Se ve que no no va a ningún lado. Entonces necesitar una persona sí o sí pasa por una justamente con el tema de lo que hablamos de la está bueno para meterlo en un B2 de la aplicación y no en el MVP. Ya, por eso y eso toca no lo veo en la está difícil, pero bueno, es un ejercicio hacer porque ahí tenemos que detectar cuáles son los patrones que son comunes para todos que para el sistema serían superútiles. Cuando yo digo campos, campos, ¿no? Yo digo la categorización de CB es fundamental. ¿Quién define si es un C para, no sé, maestro mayor de obra o alí? Es muy muy tener que saber el tema para poder hacerlo. Entonces digo, bueno, me gustaría preguntarle cómo clasifican eso decir, bueno, en el muchacho yo soy maestro mayor de bueno, ¿en qué puede trabajar? En un montón de carnos. Entonces, bueno, ahí es qué palabras o preguntas podemos hacer nosotros a la hora de que el postulante está cargando el dato para descubrir, digo yo, en qué distintos perfiles puedo claro, pero el tema es que a veces Dios, la red tediosa.

### **00:11:08**

**Diego Bussanich:** Sí, hay que buscar el equilibrio, digamos. Pensemos que nosotros venimos de la analogía total, tenemos que llegar a yo creo que con eso ya tu nombre es tuyo máximo, pero menos nombres así me voy acabando. Me escuseo investigar qué es lo que más convenía que el uso pongan currículum y que lo filtre por categorías para que la empresa lo vea oamente aparezcan publicaciones solamente de la empresa y que el usuario postule para pero por ahí tiene que haber un guía porque sabica Sí, sí. Vamos a Tinder. Tinder, ¿cómo cómo hace Marx entre la oferta y la y el postulante? Yo creo que ahí está el el ejercicio de aplicación sea un éxito o se deja en un costadito, digo yo. Podemos categorizar, podemos rubro, su rubro, ¿viste? Cuanto más eh no lo tengamos, mejor allá que no entramos a la página de de Funes y te cargar el currículo, te elegir la categoría el jardinero de lo que sea. Sí, nosotros una de las preguntas que tenemos también es si esa categoría te encasilla sí o sí. Es muy buena esa pregunta. Claro. Capaz que justa con otro también.

### **00:12:38**

**Diego Bussanich:** Olvidaste, ¿eh? Se va muerde carinero. Sí, pero estaba estudiando tema. Una sola categoría una sola. Claro, es un tema y te da un listado es que sea una sola categoría. Bueno, sería buenas palabras claves que puedas ir agregando más o menos. Hay rubros que tienen cosas, muchas cosas en común, o sea, ayudante, peón, maner de obra, albañil, eh no sé si alguna fin de eso, eh eso estaría estaría bueno también que lo piensen. Siempre tiene que situarse de los dos lados, ¿no? del lado del del que busca trabajo y también cuál es la mejor manera del lado de del administrador para porque el tema la carga del trabajo es lo que decía un poco Diego y lo que decían los chicos, o sea, tenías que entrar un portal y tení que cargar todo. Bueno, si tenés que entrar cada portal descargar todo en cada portal y es un chino. Eso es lo que pasaba hace 20 años atrás. Eh, es un chino normalmente, o sea, que te cargar para cada plataforma. Por eso que surge un portales como el LinkedIn donde a te gustir ahí y bueno y de ahí cuando decí busco trabajo ya todas las empresas te van a ayudar, ¿no?

### **00:13:49**

**Diego Bussanich:** Un poco el ejercicio es pero bueno esto es algo muy puntual obviamente la regionalidad prima un montón porque es funes y está creciendo como productivo, mucho funes y claramente va a haber necesidades puntuales de de gente para diferentes áreas, ¿no? Eh, no hay un mouse mouse ahí que estáendo pasando cargador Mario.

**Eduardo Rodriguez:** Eh, vamos a sacar esto acá.

**Diego Bussanich:** Hola, hola, hola. Bien, esto se escucha.

**Eduardo Rodriguez:** Escucha ahí. Yo te escucho ya.

**Diego Bussanich:** Hola.

**Eduardo Rodriguez:** Hola. Hola.

**Diego Bussanich:** Hola.

**Eduardo Rodriguez:** Sí, sí. E a ver, fíjate, fíjate si vos escuchas a Mario también.

**Diego Bussanich:** A ver, Mario. Sí,

**Eduardo Rodriguez:** Lo escuchab. Mario, sale ahí.

**Diego Bussanich:** sale ahí.

**Eduardo Rodriguez:** Bueno,

**Diego Bussanich:** Bueno,

**Eduardo Rodriguez:** Mario, antes

**Diego Bussanich:** tiempo sé que está está ocupado, así que vamos aprovecharlo.  Tenemos un rato para para hacer un par de preguntas. Estamos de acá.

**Eduardo Rodriguez:** de acá, soy Mario de la ciudad y un placer Bueno, pregunto por acá empieza una por persona,

**Diego Bussanich:** preguntas.

**Eduardo Rodriguez:** dos por equipo.

### **00:26:40**

**Diego Bussanich:** Bueno, buenas Marioo Máximo. Te digo, ¿cómo le llega hoy en día búsqueda de una empresa?

**Eduardo Rodriguez:** ¿Cómo hoy en día una llamada WhatsApp?

**Diego Bussanich:** Por una llamada, por WhatsApp, por Gmail.

**Eduardo Rodriguez:** En realidad llega de tod pasar se comunica.

**Diego Bussanich:** llega de WhatsApp, se comunica

**Eduardo Rodriguez:** Tengo una persona que recobre las empresas busca

**Diego Bussanich:** busca la demanda laboral, la

**Eduardo Rodriguez:** la mayor cantidad se nuestra

**Diego Bussanich:** Bien, hago solo dos preguntas. Bueno, eh, si pasan varios meses y la persona no consigue nada, ¿pasa algo con ese currículum?

**Eduardo Rodriguez:** pasa esa persona tiene que volver

**Diego Bussanich:** Esa persona tiene que volver a llamar, presentarse,

**Eduardo Rodriguez:** aarse lo que hacemos es un seguimiento.

**Diego Bussanich:** se actualiza o queda igual.

**Eduardo Rodriguez:** Eh,

**Diego Bussanich:** Eh,

**Eduardo Rodriguez:** un ejemplo, te convocamos a vos o a tu grupo.

**Diego Bussanich:** buscamos vos quedaste bien.

**Eduardo Rodriguez:** Vos quedaste,

**Diego Bussanich:** Vamos viendo,

**Eduardo Rodriguez:** vamos viendo loses que van pidiendo algunas empresas calificadurando

**Diego Bussanich:** seguimos que fueron postuladamos

**Eduardo Rodriguez:** a le damos un curso introductorio de trabajo donde enseña cómo tener presentado,

**Diego Bussanich:** donde

**Eduardo Rodriguez:** cómo desenvolverte adelante de de una persona que

**Diego Bussanich:** el la persona queita hay para que se pueda

### **00:28:15**

**Eduardo Rodriguez:** hay un sentido ahomado para que se puedan todo buenísimo. Ahí creo que me está cancelando, no sé, hay una cancelación de ruido que no sé el el audio de él, el audio de él no me sale acá.

**Diego Bussanich:** Sale.

**Eduardo Rodriguez:** Me sale por tu por tu micrófono. Me sale. Lo dej no sé por qué. mientras entra el audio.

**Diego Bussanich:** Ahí está.

**Eduardo Rodriguez:** Ahí puedo esperamos.

**Diego Bussanich:** Espera, estamos.

**Eduardo Rodriguez:** A ver, Mario. Hola. Hola,

**Diego Bussanich:** Hola,

**Eduardo Rodriguez:** hola,

**Diego Bussanich:** hola,

**Eduardo Rodriguez:** hola.

**Diego Bussanich:** hola.

**Eduardo Rodriguez:** Yo lo veo todo, lo veo todo audio. Lo veo todo, lo veo, lo veo todo. Yo no sé por qué lo veo el audio. A ver, eh,

**Diego Bussanich:** el micrófono.

**Eduardo Rodriguez:** cancelate el micrófono.

**Diego Bussanich:** ¿Dónde está?

**Eduardo Rodriguez:** A ver, el micrófono. Ya nosotros queremos que identifique. Hola, hola, hola. Yo lo escucho. Está bien que no te escucha. Bueno, yo no sé si pramente veo quién habla, quién habla y escucho la cantidad de audio, pero no eh tener que poner que salga el audio s, pero no no sé por qué no me toma la Pero yo lo escucho.

### **00:29:52**

**Eduardo Rodriguez:** Mir, vos escuchabas Mario escuchas Mario del micrófono ese. Hola. Ahora, bueno, ahora sí lo escucho. Ahora, ahora me veo a mí y lo veo esto va así. Bueno,

**Diego Bussanich:** Bueno, sigamos.

**Eduardo Rodriguez:** sigamos.

**Diego Bussanich:** en cómo es el proceso en que al postulante e lo

**Eduardo Rodriguez:** proceso mal

**Diego Bussanich:** asoci una empresa y o sea,

**Eduardo Rodriguez:** empresa saber desde que postulaste y empie trabajar en la

**Diego Bussanich:** necesito saber desde que va el postante y empieza a

**Eduardo Rodriguez:** empresa caso cualquiera que haya haya quedado haya

**Diego Bussanich:** trabajar en la empresa, un caso cualquiera que que haya que haya quedado

**Eduardo Rodriguez:** quedado seguimiento después var

**Diego Bussanich:** eso mejor responder varias preguntas. Bueno, un ejemplo,

**Eduardo Rodriguez:** que ahora es gerente en

**Diego Bussanich:** hay una chica que ahora en el Place entró con 17 años cuando abrió personas a trabajar. Esa chica de las más chicas entró en en Habana.

**Eduardo Rodriguez:** labiendo

**Diego Bussanich:** Bueno, si no dur tiempo con su

**Eduardo Rodriguez:** si no tiempo con todocia,

**Diego Bussanich:** contrato con relación,

**Eduardo Rodriguez:** Pero hayos que debe estar trabajadores

**Diego Bussanich:** pero hay casos se dejan de hacemos seguimiento siempre cada dos meses lo visitamos, vamos, vemos cómo la están llevando.

**Eduardo Rodriguez:** vamos ver cómo están llevando esa la parte de en el caso de esta

### **00:31:31**

**Diego Bussanich:** Esta es la parte de En el caso de esta chica pasó que estuvo un año

**Eduardo Rodriguez:** chica pasó tuve un año trabajando acá

**Diego Bussanich:** trabajando acá tuvo ella trabajab no me acuerdo qué era lo

**Eduardo Rodriguez:** tuvo

**Diego Bussanich:** queaba, creo que recurso mal Escobar un año justo hay una

**Eduardo Rodriguez:** una empresa Los dosen la ahí la volvieron a tomar

**Diego Bussanich:** empresa dueños tiene la estación de servicio ahí la volvieron a tomar ahí hizo dos años y ahora está

**Eduardo Rodriguez:** ahí hizo dos años y ahora está

**Diego Bussanich:** 20 años. ¿Y cómo mantienen ese contacto?

**Eduardo Rodriguez:** y cómo mantienen contactos por medio WhatsApp de WhatsApp o

**Diego Bussanich:** ¿Cuál medio? WhatsApp. WhatsApp o los visitamos personalmente mi equipo de trabajo sana

**Eduardo Rodriguez:** personalmente

**Diego Bussanich:** eh Brenda y Carolina se ocupan de dividirse en la uno y visitan a las

**Eduardo Rodriguez:** la empresa para que contraten y cuando contratan un seguimiento por

**Diego Bussanich:** empresas para que contratar un conseguimiento a los chicos. Todo casa,

**Eduardo Rodriguez:** caso mostrar tomando 60 acá también vamos a hacer un seguimiento porque

**Diego Bussanich:** tomaron 60 pilas de que también le vamos a seguimiento donde hay gente que también ha

**Eduardo Rodriguez:** hay que cambiar 60 creo que hay un 40 tomar un

**Diego Bussanich:** cambiado de 60 creo que hay en la cámara 80

### **00:32:35**

**Eduardo Rodriguez:** 20 nuevos ahora vamos viendo el por qué eh dejan de ir o

**Diego Bussanich:** jugadores vamos viendo que dejan de ir pidieron

**Eduardo Rodriguez:** describieron o chico dejan

**Diego Bussanich:** o los chicos dejan ir. Bueno, sí. Eh, bueno, Mario. Mi pregunta si cuáles son las que por parte de las empresas por

**Eduardo Rodriguez:** ¿Cuáles son las que recibir por parte de las empresas que por causa de los postulantes? Es bueno. es bueno porque te pedimos devolución porque por cada puesto

**Diego Bussanich:** solución por cada puesto mandamos cinco o seis currículos

**Eduardo Rodriguez:** mandamos eh cinco o seis currículum

**Diego Bussanich:** cada y la deción por

**Eduardo Rodriguez:** y la devolución por ahí es el descano.

**Diego Bussanich:** ahí cuando se presenta una entrevista

**Eduardo Rodriguez:** Cuando se presenta una entrevista no demuestran la la actitud que tiene que tener una persona que va a buscar un trabajo. Eh,

**Diego Bussanich:** eso lo que más marca

**Eduardo Rodriguez:** lo que más después la impunualidad.

**Diego Bussanich:** puntualidad. Sí.

**Eduardo Rodriguez:** Sí.

**Diego Bussanich:** Y por ahí se van con los padres.

**Eduardo Rodriguez:** Y por ahí que van con los parques,

**Diego Bussanich:** Mucho

**Eduardo Rodriguez:** muchos usted van por los pares, no gust

**Diego Bussanich:** Sí, porque hay muchos

**Eduardo Rodriguez:** eh parece que se dio en este tiempo,

### **00:33:48**

**Diego Bussanich:** se

**Eduardo Rodriguez:** no sé si el que eh los currículos que estamos

**Diego Bussanich:** los políos estendendo de casa

**Eduardo Rodriguez:** recibiendo son de amas de casa que bueno amas de amas de casa y los chicos 18 estudiaban también está trabajar porque que la gente no estáando

**Diego Bussanich:** Y hay mucho edad

**Eduardo Rodriguez:** pero bueno y hay mucho trabajo pero menores de edad no mayores viene a tener el gobierno con el pero lo digo como papá no no queda alguien que venga tiene 20 años bueno claro acompañarlo esperad Amos casa unos 15. Es un caso para analizar mejor mamá que mismo. Claro, es buen chico, ¿viste?

**Diego Bussanich:** ¿Qué tal? Buenas tardes. Mi pregunta es,

**Eduardo Rodriguez:** ¿Qué tal? Pregunir una

**Diego Bussanich:** ¿qué necesidades necesitabas vos para descubrir eh una plataforma como la que

**Eduardo Rodriguez:** plataforma.

**Diego Bussanich:** vamos a a realizar? Estamos a pesar en tema

**Eduardo Rodriguez:** Estamos trabajando muy artesanalmente el tema de recibimos el

**Diego Bussanich:** de

**Eduardo Rodriguez:** currículum hacemos el tiempo la chica, bueno, hace listado en la búsqueda laboral se hace muy engorroso porque no está eh por rubro, diríamos. Eso que eso se lo hagan por rubro, que se pueda categorizar categorizar y que da tengamos la posibilidad también de

### **00:35:28**

**Diego Bussanich:** la posición.

**Eduardo Rodriguez:** subir la búsqueda laboral. Da igual.

**Diego Bussanich:** lo hacemos a través del diseñador que la

**Eduardo Rodriguez:** Nosotros lo hacemos a través de la página de empleo. Hay un diseñador que la reina busca cajero,

**Diego Bussanich:** reina diseño

**Eduardo Rodriguez:** el tipo hace el el diseño, lo difundimos,

**Diego Bussanich:** el capítulo completos.

**Eduardo Rodriguez:** que manden el currículum a empleo, o se acerquen. Así vamos subiendo todo, pero estamos ya el tiempo

**Diego Bussanich:** Gracias. Buenas tardes.

**Eduardo Rodriguez:** Buenas tardes.

**Diego Bussanich:** Eh, quería preguntar si,

**Eduardo Rodriguez:** M.

**Diego Bussanich:** por ejemplo,

**Eduardo Rodriguez:** Cualquier cosa que trabajo puede

**Diego Bussanich:** una persona que se quiere inscribir a un trabajo puede inscribirse a dos trabajos distintos.

**Eduardo Rodriguez:** trabajo.

**Diego Bussanich:** O sea,

**Eduardo Rodriguez:** Sí,

**Diego Bussanich:** si yo me quiero, no sé, de cajera y no sé,

**Eduardo Rodriguez:** claro,

**Diego Bussanich:** otro empleo.

**Eduardo Rodriguez:** todo depende lo que pongan del CB porque nosotros CB si vos calificás para para la búsqueda laboral te postulamos. Si vemos que en el currículo no tiene nada que ver, no te vamos a poner esto

**Diego Bussanich:** ¿Cómo va? Eh,

**Eduardo Rodriguez:** más enlaicción

**Diego Bussanich:** más o menos que lo a ver que lo que lo puede clasificar varios trabajos.

### **00:36:37**

**Diego Bussanich:** ¿Con qué lo categoriza? con administración, por ejemplo, una palabra clave o con o lo que pide lo que pide el usuario.

**Eduardo Rodriguez:** lo que por ahí quizás queremos que ustedes lo hagan eso.

**Diego Bussanich:** P usuario. Claro.

**Eduardo Rodriguez:** Claro, esto es como te digo,

**Diego Bussanich:** Esto es como voy a empezar

**Eduardo Rodriguez:** muy artesale. Si el currículum lo reciben, lo cargan el sistema, están todos cargados,

**Diego Bussanich:** todos.

**Eduardo Rodriguez:** pero no están ordenados por como quisiéramos buscar mozo, un mozo y me salen 50 pibes, 20 pibes, parrillero, playero, no lo tenemos. Eso va a ser superior. Totalmente. Yo le voy a hacer una repregunta.

**Diego Bussanich:** Yo le voy a eh

**Eduardo Rodriguez:** Perdón que me meta. Eh, ¿a vos te gustaría que en vez de cargar la la propuesta de ustedes la puedan cargar las mismas empresas? Sí, mir ustedes hacen algún tipo de sobre las empresas, sobre cómo prueban las empresas empleo

**Diego Bussanich:** para

**Eduardo Rodriguez:** gustaría algo de eso

**Diego Bussanich:** Eh, buenas. Eh, yo quería preguntar eh,

**Eduardo Rodriguez:** fuerte.

**Diego Bussanich:** bueno, ¿qué información le gustaría poder buscar rápidamente sobre los postulantes que hoy resulta difícil encontrar?

### **00:38:08**

**Diego Bussanich:** ¿Le serviría un buscador que busque por nombre de postulante o también por categoría?

**Eduardo Rodriguez:** Sí, sería por categoría que a qué se postuló o qué puesto le gusta. Yo aparte, bueno, ahora estoy trabajando muni, pero yo fui gerente del Ministerio de Trabajo 4 años y soy permanente hace 20 años para el Ministerio especialidad de empleo que era la generación de empleo y todo eso y teníamos un sistema italiano, no me acuerdo el nombre, donde se la plataforma donde los chicos se anotaban y cliqueaban y te aparecían todos los las carreras o o puestos laborales Sí, viste estaban todos. Entonces, yo soy albañil, ponía al bañil, ¿no te lo disparaba al al formulario nuestro y cuando buscábamos ahí ya tenía disciplinado que era panadero, que era lo que sea algo así. Yo sé que se puede hacer, obvio, totalmente. Otra pregunta, perdón, ¿cuál es la acción que toma la el área de ¿Cuál es la cuál es la acción que toma la el área tuya? Eh, hay aparte de cargar, sí. Eh, ¿hay alguna acción que toma en el proceso de de hacer match entre la empresa y el candidato? Eh, nosotros lo que hacemos es hablar con la empresa por el puesto laboral. Tiene buscamos el candidato,

**Diego Bussanich:** tiene como antes

### **00:39:49**

**Eduardo Rodriguez:** le hacemos una preentrevista antes de postularlo y bueno, después una vez que nos parece que puede, como dijiste machar con la empresa, ahí sí va como postulante al a la entrevista.

**Diego Bussanich:** ¿Cómo va? Eh,

**Eduardo Rodriguez:** ¿Qué tal?

**Diego Bussanich:** yo quería saber, vimos en la página de empleos que te deja elegir un rubro,

**Eduardo Rodriguez:** la pina un

**Diego Bussanich:** se jardinería, etcétera, lo que sea. Eh, vos al cargar tu CB y elegir un determinado rubro, porque creo que te deja elegir uno solo, vos cuando carregas tu CB, ese CB queda encasillado, digamos,

**Eduardo Rodriguez:** o sea esa otra

**Diego Bussanich:** en ese rubro y por más que yo haga capaz que puedo hacer match con otra cosa, no voy a ir a parar ahí nunca.

**Eduardo Rodriguez:** cosa no vas a ir ahora tal

**Diego Bussanich:** Hoy nunca quedo siempre ahí. Entonces, estaría bueno que pueda filtrar de alguna forma.

**Eduardo Rodriguez:** cual entrar de una forma claro que pueda que te deje que marcar todo porque muchos de ustedes saben hacer muchas cosas, no solamente un no sos carrinero solamente capaz que sa mecánico,

**Diego Bussanich:** Claro.

**Eduardo Rodriguez:** no sé que

**Diego Bussanich:** O que te deje elegir varias categorías distintas.

**Eduardo Rodriguez:** es difícil La difícil

**Diego Bussanich:** Está por acá. Bueno, Mario, va la primera.

### **00:41:06**

**Diego Bussanich:** Si tuvieran que elegir un solo problema para resolver primero,

**Eduardo Rodriguez:** problema para primero,

**Diego Bussanich:** ¿cuál sería?

**Eduardo Rodriguez:** ¿cuál sería? Es difícil porque son todas el conjunto, diría. Necesitamos una completa nuevamente para que el laburo sea más eficiente y más

**Diego Bussanich:** para

**Eduardo Rodriguez:** rápido. Por ahí perdemos días en algún día esto quizá una de las clases sea ir a empleo cuando ustedes tengan tiempo y ver la cantidad de currículum como las chicas tienen que estar laborando así un manual. Entonces,

**Diego Bussanich:** el proceso de la carga de los currículos en realidad.

**Eduardo Rodriguez:** por eso sí, el proceso de la búsqueda los

**Diego Bussanich:** la organización.

**Eduardo Rodriguez:** datos cuando él la idea de esto. Oh.

**Diego Bussanich:** Sí.

**Eduardo Rodriguez:** empleoizando ya hay algunas áreas municipio y en estos tiempos difícil yendo y va

**Diego Bussanich:** Bien. ¿Cuál pregunta? Cuando una persona encuentra una oferta, ¿cómo imaginarías que debería postularse? Ejemplo, se comunica por el contacto de la empresa, ya en un formulario, se postula con su perfil y currículum.

**Eduardo Rodriguez:** empleo primero la empresa. para no quitar ese nexo que tenemos entre empresa municipio que sea

**Diego Bussanich:** Que filtre primero por el municipio,

**Eduardo Rodriguez:** empleo empleo y

### **00:42:49**

**Diego Bussanich:** digamos.

**Eduardo Rodriguez:** nosotros elegimos

**Diego Bussanich:** Perfecto. ¿Cómo está? Soy Joaquín. Eh, yo te quería consultar acerca de si hay eh un control un control previo eh de los

**Eduardo Rodriguez:** si hay un control previo

**Diego Bussanich:** CD de los currículum antes de que se almacenen, digamos, antes de que ya pasen a la ahora si algo preliminar, digamos, que ven ustedes. Sí,

**Eduardo Rodriguez:** Sí, te llega llegan por mail o la persona lo trae personalmente si lo miramos si veníamente hacemos una entrevista ahí chicas como se ocupan de

**Diego Bussanich:** vamos

**Eduardo Rodriguez:** eso y otras chicas son empleadas se ocupan de la carga y todo eso.

**Diego Bussanich:** Si

**Eduardo Rodriguez:** Ya, por también tiene el mismo proceso, se mira y se trata de reinar como dijo con Excel y esto bueno vemos que se lo van a acar no no más que eso. Claro, venimos bien igual los primeros 6 meses o 5 meses tengo 600 personas empresas ahora hay muchas empresas que están romper en esos tres lugares ya son 400 puestos de trabajo. Ahí ten los chicos. Mira acá, eh,

**Diego Bussanich:** preguntar porque si

**Eduardo Rodriguez:** ¿cuál es el digo? Primero g el equipo que gane con el proyecto, después vemos.

### **00:44:39**

**Diego Bussanich:** Vamos

**Eduardo Rodriguez:** Vamos a ver, estamosando un premio y después, bueno, después dos de los chicos más o más trabajando los mejores, los mejores, los mejores, así que pongan Yo creo que están acá porque no le gusta. Sí, sí. Yeah. un tipo como yo hablando una hora y media cumplir nada que buscan que aguantan después de todos los meses aguantar ya pasaron la prueba

**Diego Bussanich:** pregunta.

**Eduardo Rodriguez:** hacer uno más micrófono.

**Diego Bussanich:** Sí, sí, sí. Hola, ¿qué tal?

**Eduardo Rodriguez:** ¿Qué tal?

**Diego Bussanich:** Eh, bueno, queremos algo que queremos saber,

**Eduardo Rodriguez:** Queremos algo que queremos saber y estando un poco,

**Diego Bussanich:** si bien se estuvo mencionando un poco, pero es puntualmente,

**Eduardo Rodriguez:** pero esualmente qué es lo que imagen molesta hoy en día

**Diego Bussanich:** ¿qué es lo que más les molesta hoy en día porque les hace perder mucho tiempo?

**Eduardo Rodriguez:** cuando eh el tema de verlo se ve un Sí, está es como que ustedes juntan el empleo y empez a realizarse un hombre por ahí llego y me llamaron de de la regla, pidieron carrino. No hay que pasando por la piscina currículum carnicero. carnicero. Carnicero qué hace ahí ese proceso me gusta. Lo seleccionó el carnicero.

### **00:46:24**

**Eduardo Rodriguez:** Sí,

**Diego Bussanich:** Lo sé.

**Eduardo Rodriguez:** lo llaman usted está buscando. Bueno, vení, no vení mañana la oficina. Le hacemos una le hacemos una primera una vista para ver cómo estás. Verá que tieneas y ahí y

**Diego Bussanich:** Ahí

**Eduardo Rodriguez:** ahí hay un truco que la pregunta no de los chicos sino mías. ¿Todo eso lo registran en algún lado? Queda registrado cuando se entrevistó. Sí, sí. Lleva en ese mismo exel la persona, el nombre de persona que se presentó. Por eso el seguimiento también cuando vemos que no queda, vuelven a la pila de vuelta a la fila. A la fila y hacemos le hacemos el curs de un de trabajo. Ah, bien porque le enseñamos algunos cursos. Ese curso lo saqué de trabajo y lo hacíamos ahí a nivel nacional para que por ahí mucha gente laamos con mucha gente vulnerable. Los programas de estado son para esos estudios de todo también. Pero bueno, estaba dirigido a esa por ahí población,

**Diego Bussanich:** por ahí.

**Eduardo Rodriguez:** entonces teníamos que enseñarle muchas cosas porque cómo presentarse, como que sean representarse, cómo sentarse, cómo hablar con una persona que te entrevista algunas palabras que cómo contestarle trabajador también se lo da bien. ¿Quién vanar este tema y necesitan todos accesor.

### **00:47:59**

**Diego Bussanich:** y necesit necesitarían todos ¿Tú

**Eduardo Rodriguez:** Eh, sí, como cuatro del grupo

**Diego Bussanich:** quieres

**Eduardo Rodriguez:** hay algo sobre todo el proceso este que es presente en cambio Claro,

**Diego Bussanich:** Claro,

**Eduardo Rodriguez:** sí. Eh,

**Diego Bussanich:** es

**Eduardo Rodriguez:** que las empresas puedan subir eh la demanda que laboral la la entrega la del vamos a poner

**Diego Bussanich:** la vamos a poner

**Eduardo Rodriguez:** la preselección que hacen ustedes para esa demanda. También estaría bueno que ustedes también digitalmente digamos est un botón y se la pasa la empresa. Nosotros hacemos el PDF pasar y va a dar así ahí hay una ventácula de eventos que hay que ver esa posturación que fue

**Diego Bussanich:** Así hay que ver estación que fue

**Eduardo Rodriguez:** pasando entre postulante de medio municipalidad digamos hace la

**Diego Bussanich:** al

**Eduardo Rodriguez:** demanda que hay que hacer un hasta que eso se termina y los que quedan afuera tienen

**Diego Bussanich:** lo que queda

**Eduardo Rodriguez:** este esta posibilidad de detrenarse en los cursos que hay.

**Diego Bussanich:** eso está bueno.

**Eduardo Rodriguez:** Actualmente inauguramos con provincia y provincia 150 de todo tipo de

**Diego Bussanich:** de todos no

**Eduardo Rodriguez:** certificación.

**Diego Bussanich:** quería

**Eduardo Rodriguez:** Yo quería hacer una pregunta.

**Diego Bussanich:** no tenía idea.

**Eduardo Rodriguez:** Yo no tenía idea que se encargaban de hacer todo el seguimiento de la persona,

### **00:49:56**

**Diego Bussanich:** se encargab se encargaban de hablar de

**Eduardo Rodriguez:** se encargaban de hablar con ustedes, o sea,

**Diego Bussanich:** eso como que contactaban

**Eduardo Rodriguez:** como que lo llevan. Yo pensé que contactaron a las dos partes y se desligaban un poco.

**Diego Bussanich:** seaban

**Eduardo Rodriguez:** Yo estoy acá hace que la gerente viene hace dos años.

**Diego Bussanich:** gerente estado

**Eduardo Rodriguez:** Sí, estaba medio perdido el tema ese ahí no se hacía este seguimiento al

**Diego Bussanich:** ahí.

**Eduardo Rodriguez:** tener eh experiencia este tema especializar ese seguimiento porque si no el camino el quedaba ahí con y no te llam nunca vas llegando más y más y se queda abajo.

**Diego Bussanich:** van llegando.

**Eduardo Rodriguez:** Bueno,

**Diego Bussanich:** Bueno,

**Eduardo Rodriguez:** y todo este seguimiento,

**Diego Bussanich:** y seguimiento,

**Eduardo Rodriguez:** ¿vos preferirías hacerlo todo en la plataforma?

**Diego Bussanich:** vos preferirías hacerlo la plataforma del sistema. Pues claro.

**Eduardo Rodriguez:** El sistema se puede o sí claro porque pareja este chico apareció hace tr meses lo mandamos porque también podría parecer que no trabajando no trabajando política de la empresa. ¿Por qué no? ¿Por qué este y no los otros dos? Sí, también puede llegar a ser bueno para mejorar la oportunidad de no porque si no Sí, sí, o sea, quizás viene muy abajo con la moral y

### **00:51:14**

**Diego Bussanich:** ab

**Eduardo Rodriguez:** trabaj trabaj por algo formas o que tal cual que le ayude, ¿no?

**Diego Bussanich:** Las chicas son especialistas.

**Eduardo Rodriguez:** Así que son especialistas en el empleo del 2011

**Diego Bussanich:** Acá saben

**Eduardo Rodriguez:** acá saben ellos fueron capacitadas por la nación también la oficina de empleo abierta del 2011 es de la red del empleo nacional depende de ahora

**Diego Bussanich:** es de la red de empleo nacional del municipio

**Eduardo Rodriguez:** del municipio, pero es nacional.

**Diego Bussanich:** nacional.

**Eduardo Rodriguez:** Y también los indicadores, o sea, perdón, los indicadores, o sea, la cantidad de postulante diputado empresa y esos indicadores de cantidad de gente que que formalizó un trabajo,

**Diego Bussanich:** un trabajo

**Eduardo Rodriguez:** es un indicador que puedo mostrar en la página de la información.

**Diego Bussanich:** y otra otra cosa,

**Eduardo Rodriguez:** Y otra otra cosa en la decía digo

**Diego Bussanich:** en la

**Eduardo Rodriguez:** que en la página de empleo el postulante como que hace el

**Diego Bussanich:** postulante que hace el CB en la misma plataforma.

**Eduardo Rodriguez:** CB la misma plataforma entonces no es que es un es una de las

**Diego Bussanich:** es un PDF pueden

**Eduardo Rodriguez:** cosas que pedí que puedan hacer currículum que

**Diego Bussanich:** hacer currículo, sea quizás Sí,

**Eduardo Rodriguez:** o sí eso está bueno está bastante bueno,

**Diego Bussanich:** eso está bueno. Está bastante bueno.

### **00:52:31**

**Eduardo Rodriguez:** pero quizás hay gente que que no sabe Claro,

**Diego Bussanich:** Quizás hay gente que que no sabe maneja

**Eduardo Rodriguez:** se maneja abajo.

**Diego Bussanich:** abajo. Se quedó el

**Eduardo Rodriguez:** Se quedó lo que están haciendo igual lo vamos a seguir subiendo. Igual ponés una barrera y por ahí por no querer cargar la página no puedo cargar.

**Diego Bussanich:** tal.

**Eduardo Rodriguez:** Yo creo que estaría bien los dos formatos.

**Diego Bussanich:** Form.

**Eduardo Rodriguez:** Ahora igualmente lo vamos a seguir haciendo. Sabemos que yo tengo 47 años y no estoy ducho en lo que hacen ustedes.

**Diego Bussanich:** Así que imagínate que

**Eduardo Rodriguez:** Así que imagínate que yo calculo con 30 que es un tema que hablamos también de la inclusión digital de clave para para decir bueno no se queden afuera de lo que ha ganado probablemente lo sigan haciendo para canalizar el 90% por otro lado,

**Diego Bussanich:** pero va a ser Ahora,

**Eduardo Rodriguez:** pero va a ser un número menor al que tenemos ahora. Ahora,

**Diego Bussanich:** ahora casi todos digitales.

**Eduardo Rodriguez:** ahora hay casi todos las personas digital nacen desde los 3 años ya no celular ya tienen el celular. Entonces la el tema de de poder tengan en cuenta negoci desarrolle y puedan agregar un celular eso o hay una claro eh lo primero tenía que hacer mi celular fue una tal como suerte para acá a mí me

### **00:53:50**

**Diego Bussanich:** Te digo que son tienes suerte. Me gustaría entrar.

**Eduardo Rodriguez:** gustaría estar gustaría No.

**Diego Bussanich:** Ya. Ah.

**Eduardo Rodriguez:** Sí, no importa. Bueno, un paso,

**Diego Bussanich:** que lo

**Eduardo Rodriguez:** es un paso que lo quería hacer. Esto es un paso ya cuando hablamos de clase que les decía, aprovechen la oportunidad porque se gente con mucho somos viejos, digamos, eh, y entonces eso está bueno porque a mí me gusta mucho enseñar,

**Diego Bussanich:** a mí me gusta mucho trasladar y

**Eduardo Rodriguez:** trasladar la experiencia que tengo para los hijos jóvenes y que después me pareció algo muy

**Diego Bussanich:** que después me parece y realmente

**Eduardo Rodriguez:** interesante de parte de ustedes que están rehabilos a que el proyecto termina siendo un caso de éxito para uno de

**Diego Bussanich:** deciso.

**Eduardo Rodriguez:** ustedes. para un equipo de ustedes. Para mí eso, imagínate, imagínate lo que podría llegar a hacer si tuvieras un equipo así trabajando toda la municipalidad. Claro. Eh, este lo explicar a todas las áreas bolazo. Bolazo.

**Diego Bussanich:** Ahí sí,

**Eduardo Rodriguez:** Ahí sí hay parte,

**Diego Bussanich:** pero el pleno

**Eduardo Rodriguez:** pero bueno hora del empleo después estaremos pasando por otra y podemos replicar.

**Diego Bussanich:** así preguntas

### **00:55:08**

**Eduardo Rodriguez:** Así es. Mario. Preguntas a los gráficos.

**Diego Bussanich:** ag un segundotas

**Eduardo Rodriguez:** trabajando eh por

**Diego Bussanich:** trabaja desde casa. por ahora que no

**Eduardo Rodriguez:** ahora no ya que no no se dio. Espérate. Sí, sí.

**Diego Bussanich:** hace

**Eduardo Rodriguez:** ¿Cómo hace? Yo trabajo todo. Claro. Yo te mando un correo, le digo,"Subme, Mario, estas tres búsquedas que tengo. De hecho, me pé con Julio. Sí, la otra vez para variar porque nosotros estamos pagando,

**Diego Bussanich:** porque

**Eduardo Rodriguez:** digamos, una bicía para hacer las notas y demás. Le digo, publicame tres, no tengo cobrar parte." Digo,

**Diego Bussanich:** sabía sinceramente

**Eduardo Rodriguez:** "¿Pero dónde público?" Yo no sabía la gente que ustedes lo hacían yo gente de acá porque entrenar y demás qué sé yo y no sabíamos cómo

**Diego Bussanich:** y

**Eduardo Rodriguez:** publicar totalmente nosotros vamos directamente al y ahí subimos nuestro refugio.

**Diego Bussanich:** ahí donde yo

**Eduardo Rodriguez:** no fíjate qué importante es tener un portal donde yo diga,

**Diego Bussanich:** diga no ando

**Eduardo Rodriguez:** bueno, no andar el portal de Jen todo hubiese sido parte que o sea el hecho de que tenga visibilidad que te levanten los medios que la gente sabe buscar o que pueda encontrar de repente

### **00:56:22**

**Diego Bussanich:** una propuesta, digamos,

**Eduardo Rodriguez:** una propuesta digamos personal digamos que tengas para

**Diego Bussanich:** personal

**Eduardo Rodriguez:** sonarte y la también nosotros como gente mucha gente en toda América Latina

**Diego Bussanich:** también digo

**Eduardo Rodriguez:** trabajando y tenemos proyectos muy grandes y gente que no conocemos.

**Diego Bussanich:** no le conozco la

**Eduardo Rodriguez:** una gente y y trabajamos muy bien,

**Diego Bussanich:** Trabajamos

**Eduardo Rodriguez:** muy bien. trabaja muy bien diferentes partes de España, México, de todos lados y y nada,

**Diego Bussanich:** y personal y adelante.

**Eduardo Rodriguez:** está bueno también esta experiencia de que personal eh poder llevar adelante con la muñe Ah. ¿Cómo es qué te pones vos de la horario de tu casa y qué te pones un horario vos el

**Diego Bussanich:** tu

**Eduardo Rodriguez:** horario o ustedes le ponen el horario de Argentina porque hay gente de todos lados de España, de Perú, del México, o sea, tenemos gente con más menos cco hora, más 5 horas menos tr los feriados y de trabajo y la argentina o tiene que estar todos. Sí, la gente levantar temprano. Nuestro caso no se controla el estar, digamos, a veces está o no.

**Diego Bussanich:** por trabaja mucho

**Eduardo Rodriguez:** Se trabaja mucho por productividad, por sprint. Nosotros usamos metodologías ágiles y tiene que ver con poner objetivos semanales o funcionales

### **00:57:40**

**Diego Bussanich:** tiene que semanales

**Eduardo Rodriguez:** donde vamos cumpliendo de donde cada uno siía la rev que venía la del todos los días 15 minutos y después te fuiste a hacer la compra del súper o te fuiste a la plaza o lo que fuera no hay problema siempre y cuando vos olvidas que tengas que entregar igual las empresas de tecnología a ese formato. Tenes que adaptar la la pandemia cambió todo, ¿no? la familia

**Diego Bussanich:** Sí

**Eduardo Rodriguez:** existe la existe todo, pero pero física ten una física para que vean un poco la la dinámica,

**Diego Bussanich:** para que el ámbito de trabajo

**Eduardo Rodriguez:** el ámbito de trabajo, trabaja, tenemos hacemos reuniones entrevista,

**Diego Bussanich:** reunión, Pero

**Eduardo Rodriguez:** pero dejó de ser lo que era antes, acuerdo en la vieja época mía todos conejito, uno al lado del otro eso

**Diego Bussanich:** es

**Eduardo Rodriguez:** dejó cambió profundamente imposible. De hecho, hay gente que vive en así que no, pero bien,

**Diego Bussanich:** y el trabajo.

**Eduardo Rodriguez:** pero para bien.

**Diego Bussanich:** ¿Te gustaría hacerlo vos también de manera remota de poder en tu casa filtrarlo?

**Eduardo Rodriguez:** Sí, sí, porque como te digo, las corridas, claro, estoy estoy de secretario desarrollo productivo y empleo y ahora se me sumó que tengo que ser

**Diego Bussanich:** asesor

**Eduardo Rodriguez:** asesor de roling, estoy viajando todos lados y ya me con estaría bueno en un momento que te metas en la computadora y en serio en realidad de acá deberías poder hacerlo. Sí, sí, te encuentro golazo. había hecho sobre

**Diego Bussanich:** mi pregunta tiene que ver más que nada con el tema este que están hablando de las de las métricas por ahí o saber la tasa de empleabilidad.

**Eduardo Rodriguez:** la reportar número a pasar.

**Diego Bussanich:** Ustedes tienen que reportar números a alguien que esos números queden guardados en alguna parte.

**Eduardo Rodriguez:** Nos gustaría tener los números muy importantes por ahíortar alguien.

**Diego Bussanich:** Para ahí tienen que reportar alguien provincia.

**Eduardo Rodriguez:** Eh, sí, por ahí te pide mismo municipio.

**Diego Bussanich:** la provincia.

**Eduardo Rodriguez:** La provincia también nos pide datos de automáticos indicadores debería ser

**Diego Bussanich:** Claro, por eso si lo hacen análogo

**Eduardo Rodriguez:** yo te dije 600 porque los contar por ahí por medio

**Diego Bussanich:** es

**Eduardo Rodriguez:** vamos viendo sacando y lo tenemos anotado.

**Diego Bussanich:** con cada carga que ya esté completa que mar indicador

**Eduardo Rodriguez:** Claro, lo haga facilísimo. Algo para brindar o estamos estamos todos aprendimos todo,

**Diego Bussanich:** Estamos, estamos

**Eduardo Rodriguez:** ¿no? Madalo. Bueno,

**Diego Bussanich:** de nuestra parte de agradecer muy necesario.

### **La transcripción finalizó después de 01:05:12**

*Esta transcripción editable se generó por computadora y puede contener errores. Los usuarios también pueden cambiar el texto después de que se cree.*
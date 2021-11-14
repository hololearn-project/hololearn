/* eslint-disable */
var obj3D, gui, skeletonHelper, bones, skinnedMesh, skeleton, geometry, face, faceGeometry, vertMarker, meshes, bodyGroup;
var material = new THREE.MeshPhongMaterial( {
  skinning : true,
  color: 0x055289,
  emissive: 0x162534,
  side: THREE.DoubleSide,
  flatShading: true,
  vertexColors: true
} );

var vertGeometry = new THREE.BoxGeometry(5, 5, 5);
var basicMaterial = new THREE.MeshBasicMaterial({
  color: 0x0000ff,
  transparent: false
});

const textureLoader = new THREE.TextureLoader();

const mapping = [173,
  155,
  133,
  246,
  33,
  7,
  382,
  398,
  362,
  263,
  466,
  249,
  308,
  415,
  324,
  78,
  95,
  191,
  356,
  389,
  264,
  127,
  34,
  162,
  368,
  139,
  267,
  0,
  302,
  37,
  72,
  11,
  349,
  451,
  350,
  120,
  121,
  231,
  452,
  232,
  269,
  39,
  303,
  73,
  357,
  343,
  128,
  114,
  277,
  47,
  453,
  233,
  299,
  333,
  297,
  69,
  67,
  104,
  332,
  103,
  175,
  152,
  396,
  171,
  377,
  148,
  381,
  384,
  154,
  157,
  280,
  347,
  330,
  50,
  101,
  118,
  348,
  119,
  270,
  40,
  304,
  74,
  9,
  336,
  151,
  107,
  337,
  108,
  344,
  278,
  360,
  115,
  131,
  48,
  279,
  49,
  262,
  431,
  418,
  32,
  194,
  211,
  424,
  204,
  408,
  184,
  409,
  185,
  272,
  310,
  407,
  42,
  183,
  80,
  322,
  410,
  92,
  186,
  449,
  229,
  450,
  230,
  434,
  432,
  430,
  214,
  210,
  212,
  422,
  202,
  313,
  314,
  18,
  83,
  84,
  17,
  307,
  375,
  306,
  77,
  76,
  146,
  291,
  61,
  259,
  387,
  260,
  29,
  30,
  160,
  388,
  161,
  286,
  414,
  56,
  190,
  406,
  182,
  335,
  106,
  367,
  416,
  364,
  138,
  135,
  192,
  391,
  423,
  327,
  165,
  98,
  203,
  358,
  129,
  298,
  301,
  284,
  68,
  54,
  71,
  251,
  21,
  4,
  275,
  5,
  45,
  281,
  51,
  254,
  373,
  253,
  24,
  23,
  144,
  374,
  145,
  320,
  321,
  90,
  91,
  425,
  411,
  187,
  205,
  427,
  207,
  421,
  200,
  201,
  405,
  181,
  404,
  180,
  16,
  315,
  85,
  266,
  426,
  206,
  36,
  369,
  400,
  140,
  176,
  417,
  465,
  413,
  193,
  189,
  245,
  464,
  244,
  257,
  258,
  386,
  27,
  159,
  28,
  385,
  158,
  467,
  247,
  248,
  456,
  419,
  3,
  196,
  236,
  399,
  174,
  285,
  8,
  55,
  168,
  340,
  261,
  346,
  111,
  117,
  31,
  448,
  228,
  441,
  221,
  460,
  326,
  97,
  240,
  328,
  99,
  355,
  329,
  100,
  126,
  371,
  142,
  309,
  392,
  438,
  79,
  218,
  166,
  439,
  219,
  256,
  26,
  341,
  112,
  420,
  198,
  429,
  209,
  365,
  379,
  136,
  150,
  394,
  169,
  437,
  217,
  443,
  444,
  282,
  223,
  52,
  224,
  283,
  53,
  363,
  134,
  440,
  220,
  395,
  170,
  338,
  109,
  273,
  43,
  359,
  342,
  113,
  130,
  446,
  226,
  334,
  105,
  293,
  63,
  250,
  458,
  462,
  20,
  242,
  238,
  461,
  241,
  276,
  353,
  300,
  46,
  70,
  124,
  383,
  156,
  325,
  292,
  96,
  62,
  447,
  345,
  227,
  116,
  372,
  143,
  352,
  123,
  1,
  19,
  274,
  44,
  354,
  125,
  436,
  216,
  380,
  252,
  153,
  22,
  393,
  167,
  199,
  428,
  208,
  287,
  57,
  290,
  60,
  265,
  35,
  445,
  225,
  366,
  137,
  268,
  38,
  271,
  41,
  294,
  64,
  455,
  235,
  331,
  102,
  378,
  149,
  296,
  66,
  351,
  122,
  6,
  376,
  147,
  319,
  89,
  295,
  65,
  403,
  179,
  323,
  454,
  93,
  234,
  15,
  316,
  86,
  14,
  317,
  87,
  402,
  318,
  178,
  88,
  197,
  397,
  172,
  288,
  435,
  58,
  215,
  311,
  81,
  195,
  312,
  82,
  339,
  110,
  390,
  163,
  10,
  442,
  222,
  94,
  370,
  141,
  255,
  25,
  457,
  237,
  412,
  188,
  164,
  2,
  12,
  13,
  463,
  243,
  459,
  239,
  401,
  177,
  361,
  132,
  433,
  213,
  289,
  59,
  305,
  75];

const x_uv = [0.4996336996337,
  0.4998778998779,
  0.4996336996337,
  0.481807081807082,
  0.4998778998779,
  0.4996336996337,
  0.499389499389499,
  0.289377289377289,
  0.4996336996337,
  0.4996336996337,
  0.4998778998779,
  0.4998778998779,
  0.4998778998779,
  0.4998778998779,
  0.4996336996337,
  0.4996336996337,
  0.4996336996337,
  0.4996336996337,
  0.4996336996337,
  0.4996336996337,
  0.473504273504273,
  0.104517704517705,
  0.365567765567766,
  0.338461538461538,
  0.310866910866911,
  0.274236874236874,
  0.393162393162393,
  0.345054945054945,
  0.36971916971917,
  0.318925518925519,
  0.297680097680098,
  0.247374847374847,
  0.396581196581197,
  0.27985347985348,
  0.105982905982906,
  0.20952380952381,
  0.355555555555556,
  0.471550671550672,
  0.473992673992674,
  0.43956043956044,
  0.414407814407814,
  0.45006105006105,
  0.428571428571429,
  0.374603174603175,
  0.486446886446886,
  0.484981684981685,
  0.257387057387057,
  0.400976800976801,
  0.42954822954823,
  0.421001221001221,
  0.276678876678877,
  0.483028083028083,
  0.336996336996337,
  0.296214896214896,
  0.168986568986569,
  0.447374847374847,
  0.392185592185592,
  0.354090354090354,
  0.0669108669108669,
  0.442490842490842,
  0.456898656898657,
  0.381684981684982,
  0.392185592185592,
  0.276678876678877,
  0.422222222222222,
  0.385592185592186,
  0.382905982905983,
  0.331135531135531,
  0.22954822954823,
  0.364102564102564,
  0.229304029304029,
  0.172893772893773,
  0.472527472527473,
  0.446642246642247,
  0.422466422466422,
  0.444932844932845,
  0.387789987789988,
  0.402686202686203,
  0.403418803418803,
  0.45982905982906,
  0.431013431013431,
  0.452014652014652,
  0.475213675213675,
  0.465689865689866,
  0.472039072039072,
  0.472771672771673,
  0.472771672771673,
  0.472771672771673,
  0.427594627594628,
  0.426129426129426,
  0.422954822954823,
  0.418070818070818,
  0.38974358974359,
  0.0136752136752137,
  0.4996336996337,
  0.412942612942613,
  0.409279609279609,
  0.467887667887668,
  0.422466422466422,
  0.462759462759463,
  0.371916971916972,
  0.334310134310134,
  0.411477411477411,
  0.241758241758242,
  0.290598290598291,
  0.326984126984127,
  0.399267399267399,
  0.441514041514041,
  0.42954822954823,
  0.411965811965812,
  0.288644688644689,
  0.218559218559219,
  0.412454212454212,
  0.256898656898657,
  0.427350427350427,
  0.448107448107448,
  0.178266178266178,
  0.246886446886447,
  0.285958485958486,
  0.332600732600733,
  0.368498168498169,
  0.398778998778999,
  0.476190476190476,
  0.189010989010989,
  0.228571428571429,
  0.490598290598291,
  0.404395604395604,
  0.019047619047619,
  0.425885225885226,
  0.396825396825397,
  0.266178266178266,
  0.438827838827839,
  0.031990231990232,
  0.418803418803419,
  0.462515262515263,
  0.238583638583639,
  0.197802197802198,
  0.107203907203907,
  0.183394383394383,
  0.134065934065934,
  0.385592185592186,
  0.490842490842491,
  0.382173382173382,
  0.174114774114774,
  0.318437118437118,
  0.343101343101343,
  0.395848595848596,
  0.187545787545788,
  0.430769230769231,
  0.318681318681319,
  0.265934065934066,
  0.4998778998779,
  0.4996336996337,
  0.365811965811966,
  0.392918192918193,
  0.41001221001221,
  0.194627594627595,
  0.388278388278388,
  0.365567765567766,
  0.343101343101343,
  0.318437118437118,
  0.301098901098901,
  0.0578754578754579,
  0.301098901098901,
  0.4996336996337,
  0.415628815628816,
  0.445421245421245,
  0.465689865689866,
  0.4996336996337,
  0.288400488400488,
  0.335042735042735,
  0.44029304029304,
  0.127960927960928,
  0.408547008547009,
  0.455433455433455,
  0.4996336996337,
  0.375091575091575,
  0.113797313797314,
  0.448351648351648,
  0.447863247863248,
  0.446886446886447,
  0.444688644688645,
  0.42979242979243,
  0.406593406593407,
  0.400488400488401,
  0.392185592185592,
  0.367521367521368,
  0.247619047619048,
  0.452503052503053,
  0.436141636141636,
  0.415873015873016,
  0.413186813186813,
  0.227594627594628,
  0.468131868131868,
  0.410989010989011,
  0.4996336996337,
  0.478876678876679,
  0.4996336996337,
  0.431746031746032,
  0.4996336996337,
  0.4996336996337,
  0.456410256410256,
  0.344322344322344,
  0.378754578754579,
  0.374114774114774,
  0.319413919413919,
  0.356776556776557,
  0.294993894993895,
  0.447374847374847,
  0.410744810744811,
  0.313553113553114,
  0.353846153846154,
  0.324297924297924,
  0.188766788766789,
  0.279365079365079,
  0.133577533577534,
  0.336507936507937,
  0.42954822954823,
  0.455189255189255,
  0.436874236874237,
  0.467155067155067,
  0.414407814407814,
  0.376800976800977,
  0.343833943833944,
  0.312576312576313,
  0.283272283272283,
  0.241025641025641,
  0.102564102564103,
  0.267399267399267,
  0.297680097680098,
  0.333089133089133,
  0.366056166056166,
  0.395848595848596,
  0.41978021978022,
  0.00708180708180708,
  0.432722832722833,
  0.458363858363858,
  0.473260073260073,
  0.475946275946276,
  0.468131868131868,
  0.433699633699634,
  0.483272283272283,
  0.482295482295482,
  0.426129426129426,
  0.438827838827839,
  0.44981684981685,
  0.289377289377289,
  0.276434676434676,
  0.517704517704518,
  0.71013431013431,
  0.526007326007326,
  0.894993894993895,
  0.633943833943834,
  0.661050061050061,
  0.688644688644689,
  0.725274725274725,
  0.606349206349206,
  0.654456654456654,
  0.62979242979243,
  0.680586080586081,
  0.701831501831502,
  0.752136752136752,
  0.602686202686203,
  0.71965811965812,
  0.893528693528694,
  0.78998778998779,
  0.643711843711844,
  0.527960927960928,
  0.525518925518926,
  0.55995115995116,
  0.585103785103785,
  0.549450549450549,
  0.570940170940171,
  0.624664224664225,
  0.512820512820513,
  0.514774114774115,
  0.742124542124542,
  0.598290598290598,
  0.57020757020757,
  0.578510378510379,
  0.722832722832723,
  0.516239316239316,
  0.662515262515262,
  0.703540903540904,
  0.830525030525031,
  0.552136752136752,
  0.607326007326007,
  0.645177045177045,
  0.932600732600733,
  0.557020757020757,
  0.542612942612943,
  0.617826617826618,
  0.607326007326007,
  0.722832722832723,
  0.577289377289377,
  0.613919413919414,
  0.616605616605617,
  0.668376068376068,
  0.76996336996337,
  0.635409035409035,
  0.77020757020757,
  0.826617826617827,
  0.526984126984127,
  0.552869352869353,
  0.577045177045177,
  0.554578754578755,
  0.611721611721612,
  0.596825396825397,
  0.596092796092796,
  0.53968253968254,
  0.568498168498168,
  0.547496947496948,
  0.524297924297924,
  0.533821733821734,
  0.527472527472527,
  0.526739926739927,
  0.526739926739927,
  0.526739926739927,
  0.571916971916972,
  0.573382173382173,
  0.576556776556777,
  0.581440781440781,
  0.60976800976801,
  0.985836385836386,
  0.586568986568987,
  0.59023199023199,
  0.531623931623932,
  0.577045177045177,
  0.536752136752137,
  0.627350427350427,
  0.665445665445665,
  0.588034188034188,
  0.757753357753358,
  0.709157509157509,
  0.672527472527473,
  0.6002442002442,
  0.557997557997558,
  0.56996336996337,
  0.588034188034188,
  0.710866910866911,
  0.780952380952381,
  0.587057387057387,
  0.742612942612943,
  0.571916971916972,
  0.551648351648352,
  0.821245421245421,
  0.752625152625153,
  0.713553113553114,
  0.666910866910867,
  0.630769230769231,
  0.600732600732601,
  0.523321123321123,
  0.810500610500611,
  0.770940170940171,
  0.508913308913309,
  0.595115995115995,
  0.98046398046398,
  0.573382173382173,
  0.602686202686203,
  0.733333333333333,
  0.56043956043956,
  0.967521367521368,
  0.580708180708181,
  0.537484737484737,
  0.760683760683761,
  0.801709401709402,
  0.892307692307692,
  0.816117216117216,
  0.865445665445665,
  0.613919413919414,
  0.508669108669109,
  0.617826617826618,
  0.825396825396825,
  0.681074481074481,
  0.656410256410256,
  0.603663003663004,
  0.811965811965812,
  0.567765567765568,
  0.680830280830281,
  0.733577533577534,
  0.633699633699634,
  0.606593406593407,
  0.58949938949939,
  0.804884004884005,
  0.611233211233211,
  0.633943833943834,
  0.656410256410256,
  0.681074481074481,
  0.698412698412698,
  0.941636141636142,
  0.698412698412698,
  0.583882783882784,
  0.554090354090354,
  0.533821733821734,
  0.711111111111111,
  0.664468864468864,
  0.558974358974359,
  0.871550671550672,
  0.590964590964591,
  0.544078144078144,
  0.624420024420024,
  0.885714285714286,
  0.551159951159951,
  0.551648351648352,
  0.552625152625153,
  0.554822954822955,
  0.56971916971917,
  0.592918192918193,
  0.599023199023199,
  0.607326007326007,
  0.631746031746032,
  0.751892551892552,
  0.547008547008547,
  0.563369963369963,
  0.583638583638584,
  0.586324786324786,
  0.771672771672772,
  0.531379731379731,
  0.588034188034188,
  0.520634920634921,
  0.567765567765568,
  0.543101343101343,
  0.655189255189255,
  0.620757020757021,
  0.625396825396825,
  0.68009768009768,
  0.642490842490843,
  0.704517704517705,
  0.551892551892552,
  0.588766788766789,
  0.685714285714286,
  0.645421245421245,
  0.675213675213675,
  0.810744810744811,
  0.71990231990232,
  0.865934065934066,
  0.663003663003663,
  0.56996336996337,
  0.544322344322344,
  0.562637362637363,
  0.531868131868132,
  0.585103785103785,
  0.622710622710623,
  0.655677655677656,
  0.686935286935287,
  0.716239316239316,
  0.758485958485958,
  0.896947496947497,
  0.732112332112332,
  0.701831501831502,
  0.666422466422466,
  0.633211233211233,
  0.603663003663004,
  0.57948717948718,
  0.992429792429792,
  0.567032967032967,
  0.541147741147741,
  0.526251526251526,
  0.523565323565324,
  0.531379731379731,
  0.565811965811966,
  0.515995115995116,
  0.517216117216117,
  0.573382173382173,
  0.56043956043956,
  0.549450549450549,
  0.71013431013431,
  0.723076923076923,
  ]

const y_uv = [0.347741147741148,
  0.452747252747253,
  0.397802197802198,
  0.528205128205128,
  0.473015873015873,
  0.502075702075702,
  0.599267399267399,
  0.61953601953602,
  0.687912087912088,
  0.73040293040293,
  0.893284493284493,
  0.334065934065934,
  0.320879120879121,
  0.307936507936508,
  0.305006105006105,
  0.294261294261294,
  0.280830280830281,
  0.263247863247863,
  0.218559218559219,
  0.437362637362637,
  0.426373626373626,
  0.746275946275946,
  0.590720390720391,
  0.587301587301587,
  0.590720390720391,
  0.611233211233211,
  0.596581196581197,
  0.656166056166056,
  0.654212454212454,
  0.652991452991453,
  0.646642246642247,
  0.58949938949939,
  0.157509157509158,
  0.624664224664225,
  0.6002442002442,
  0.609035409035409,
  0.465934065934066,
  0.34969474969475,
  0.31990231990232,
  0.342857142857143,
  0.333577533577534,
  0.319413919413919,
  0.317460317460317,
  0.272283272283272,
  0.452503052503053,
  0.472771672771673,
  0.685714285714286,
  0.545054945054945,
  0.451526251526252,
  0.466422466422466,
  0.468131868131868,
  0.500610500610501,
  0.717460317460317,
  0.706959706959707,
  0.806593406593407,
  0.697680097680098,
  0.646398046398046,
  0.303296703296703,
  0.27008547008547,
  0.427350427350427,
  0.415384615384615,
  0.305494505494506,
  0.305982905982906,
  0.728449328449328,
  0.436874236874237,
  0.718925518925519,
  0.744566544566545,
  0.880586080586081,
  0.768253968253968,
  0.811233211233211,
  0.700854700854701,
  0.721611721611722,
  0.334065934065934,
  0.331623931623932,
  0.326251526251526,
  0.42026862026862,
  0.306227106227106,
  0.293772893772894,
  0.306227106227106,
  0.442979242979243,
  0.307936507936508,
  0.307936507936508,
  0.307936507936508,
  0.221001221001221,
  0.263980463980464,
  0.282295482295482,
  0.295482295482295,
  0.305006105006105,
  0.305006105006105,
  0.296703296703297,
  0.288400488400488,
  0.28009768009768,
  0.360683760683761,
  0.44029304029304,
  0.42002442002442,
  0.304761904761905,
  0.298412698412698,
  0.398778998778999,
  0.414163614163614,
  0.406349206349206,
  0.526739926739927,
  0.504273504273504,
  0.453235653235653,
  0.852747252747253,
  0.798778998778999,
  0.743833943833944,
  0.251282051282051,
  0.738705738705739,
  0.812454212454212,
  0.891330891330891,
  0.601221001221001,
  0.564835164835165,
  0.601221001221001,
  0.644932844932845,
  0.562393162393162,
  0.463247863247863,
  0.542612942612943,
  0.543101343101343,
  0.532600732600733,
  0.539438339438339,
  0.553113553113553,
  0.567521367521368,
  0.594383394383394,
  0.476434676434676,
  0.651282051282051,
  0.437851037851038,
  0.515018315018315,
  0.598778998778999,
  0.57973137973138,
  0.451526251526252,
  0.623199023199023,
  0.481318681318681,
  0.355799755799756,
  0.613186813186813,
  0.494505494505495,
  0.220512820512821,
  0.168253968253968,
  0.45958485958486,
  0.25982905982906,
  0.666666666666667,
  0.116971916971917,
  0.420757020757021,
  0.491575091575092,
  0.602686202686203,
  0.604151404151404,
  0.5997557997558,
  0.28986568986569,
  0.411721611721612,
  0.0561660561660562,
  0.101831501831502,
  0.13040293040293,
  0.80976800976801,
  0.0456654456654457,
  0.601465201465201,
  0.604639804639805,
  0.609279609279609,
  0.658119658119658,
  0.638095238095238,
  0.644200244200244,
  0.644932844932845,
  0.642002442002442,
  0.637118437118437,
  0.681318681318681,
  0.612942612942613,
  0.381684981684982,
  0.376068376068376,
  0.434188034188034,
  0.379487179487179,
  0.648840048840049,
  0.18021978021978,
  0.147252747252747,
  0.0976800976800977,
  0.208302808302808,
  0.626373626373626,
  0.548473748473749,
  0.0910866910866911,
  0.0759462759462759,
  0.385103785103785,
  0.305006105006105,
  0.295482295482295,
  0.284493284493284,
  0.269352869352869,
  0.233455433455433,
  0.314529914529915,
  0.319169719169719,
  0.322588522588523,
  0.336263736263736,
  0.398778998778999,
  0.57948717948718,
  0.64029304029304,
  0.631501831501831,
  0.307936507936508,
  0.316727716727717,
  0.647619047619048,
  0.195848595848596,
  0.53040293040293,
  0.557509157509158,
  0.560683760683761,
  0.506715506715507,
  0.133333333333333,
  0.178510378510379,
  0.180952380952381,
  0.254700854700855,
  0.426129426129426,
  0.22002442002442,
  0.42954822954823,
  0.395848595848596,
  0.378754578754579,
  0.137728937728938,
  0.491575091575092,
  0.224908424908425,
  0.187545787545788,
  0.296214896214896,
  0.353846153846154,
  0.285470085470085,
  0.317460317460317,
  0.355555555555556,
  0.533821733821734,
  0.451526251526252,
  0.441269841269841,
  0.47032967032967,
  0.664957264957265,
  0.677411477411477,
  0.68009768009768,
  0.677899877899878,
  0.667155067155067,
  0.617582417582418,
  0.531379731379731,
  0.575824175824176,
  0.567032967032967,
  0.566300366300366,
  0.574114774114774,
  0.583638583638584,
  0.58998778998779,
  0.519413919413919,
  0.430769230769231,
  0.521123321123321,
  0.454456654456654,
  0.436385836385836,
  0.445177045177045,
  0.417826617826618,
  0.437362637362637,
  0.422466422466422,
  0.610500610500611,
  0.603663003663004,
  0.5997557997558,
  0.631990231990232,
  0.636874236874237,
  0.528205128205128,
  0.61953601953602,
  0.426373626373626,
  0.746275946275946,
  0.590720390720391,
  0.587301587301587,
  0.590720390720391,
  0.611233211233211,
  0.596581196581197,
  0.656166056166056,
  0.654212454212454,
  0.652991452991453,
  0.646642246642247,
  0.58949938949939,
  0.157264957264957,
  0.624664224664225,
  0.6002442002442,
  0.609035409035409,
  0.465689865689866,
  0.34969474969475,
  0.31990231990232,
  0.342857142857143,
  0.333577533577534,
  0.319413919413919,
  0.317460317460317,
  0.272039072039072,
  0.452991452991453,
  0.473015873015873,
  0.685714285714286,
  0.545299145299145,
  0.451770451770452,
  0.466666666666667,
  0.468131868131868,
  0.500610500610501,
  0.717460317460317,
  0.706959706959707,
  0.806593406593407,
  0.697680097680098,
  0.646398046398046,
  0.303540903540904,
  0.27008547008547,
  0.427350427350427,
  0.415384615384615,
  0.305494505494506,
  0.305982905982906,
  0.728449328449328,
  0.437118437118437,
  0.718925518925519,
  0.744322344322344,
  0.88034188034188,
  0.768253968253968,
  0.810989010989011,
  0.700854700854701,
  0.721611721611722,
  0.334065934065934,
  0.331623931623932,
  0.326251526251526,
  0.42026862026862,
  0.306227106227106,
  0.293772893772894,
  0.306227106227106,
  0.442979242979243,
  0.307936507936508,
  0.307936507936508,
  0.307936507936508,
  0.221001221001221,
  0.263980463980464,
  0.282295482295482,
  0.295482295482295,
  0.305006105006105,
  0.305006105006105,
  0.296703296703297,
  0.288400488400488,
  0.28009768009768,
  0.36019536019536,
  0.44029304029304,
  0.304761904761905,
  0.298412698412698,
  0.398778998778999,
  0.414407814407814,
  0.406349206349206,
  0.526984126984127,
  0.504273504273504,
  0.453479853479853,
  0.852747252747253,
  0.798778998778999,
  0.743833943833944,
  0.251282051282051,
  0.738705738705739,
  0.812454212454212,
  0.891330891330891,
  0.601221001221001,
  0.564835164835165,
  0.601221001221001,
  0.644932844932845,
  0.562637362637363,
  0.463736263736264,
  0.542612942612943,
  0.543101343101343,
  0.532600732600733,
  0.53968253968254,
  0.553113553113553,
  0.567765567765568,
  0.594627594627595,
  0.476190476190476,
  0.651282051282051,
  0.437606837606838,
  0.515262515262515,
  0.598778998778999,
  0.58021978021978,
  0.451526251526252,
  0.623199023199023,
  0.481318681318681,
  0.355799755799756,
  0.613186813186813,
  0.494749694749695,
  0.220512820512821,
  0.168253968253968,
  0.45958485958486,
  0.25982905982906,
  0.666666666666667,
  0.116971916971917,
  0.420757020757021,
  0.491819291819292,
  0.602686202686203,
  0.604151404151404,
  0.5997557997558,
  0.28986568986569,
  0.411721611721612,
  0.0556776556776557,
  0.101831501831502,
  0.13040293040293,
  0.601465201465201,
  0.604639804639805,
  0.609279609279609,
  0.658119658119658,
  0.638095238095238,
  0.644200244200244,
  0.644932844932845,
  0.642002442002442,
  0.637118437118437,
  0.681318681318681,
  0.612942612942613,
  0.376068376068376,
  0.434188034188034,
  0.379487179487179,
  0.18021978021978,
  0.147252747252747,
  0.0974358974358974,
  0.208302808302808,
  0.626373626373626,
  0.548717948717949,
  0.0759462759462759,
  0.385103785103785,
  0.305006105006105,
  0.295482295482295,
  0.284493284493284,
  0.269352869352869,
  0.233211233211233,
  0.314529914529915,
  0.319169719169719,
  0.322588522588523,
  0.336752136752137,
  0.399023199023199,
  0.57997557997558,
  0.64053724053724,
  0.631501831501831,
  0.307936507936508,
  0.316727716727717,
  0.647863247863248,
  0.195848595848596,
  0.557753357753358,
  0.506715506715507,
  0.180952380952381,
  0.254700854700855,
  0.426129426129426,
  0.21978021978022,
  0.42954822954823,
  0.395848595848596,
  0.378754578754579,
  0.137484737484737,
  0.491575091575092,
  0.224908424908425,
  0.187545787545788,
  0.296214896214896,
  0.353846153846154,
  0.285470085470085,
  0.317460317460317,
  0.355555555555556,
  0.533821733821734,
  0.451770451770452,
  0.441514041514041,
  0.47008547008547,
  0.665201465201465,
  0.677411477411477,
  0.68009768009768,
  0.677899877899878,
  0.667155067155067,
  0.617582417582418,
  0.531379731379731,
  0.575824175824176,
  0.567032967032967,
  0.566300366300366,
  0.574114774114774,
  0.583638583638584,
  0.59023199023199,
  0.519413919413919,
  0.430769230769231,
  0.521367521367521,
  0.454212454212454,
  0.436385836385836,
  0.445177045177045,
  0.417826617826618,
  0.437118437118437,
  0.422466422466422,
  0.610500610500611,
  0.604884004884005,
  0.6004884004884,
  0.631990231990232,
  0.636874236874237  
  ]

function changeXoffset(diff) {
  X_OFFSET += diff
}

function changeYoffset(diff) {
  Y_OFFSET += diff
}

function changeZoffset(diff) {
  Z_OFFSET += diff
  console.log("new offset:\n", X_OFFSET, Y_OFFSET, Z_OFFSET);
}

function updateMult(){
  MULT = parseInt(document.getElementById('multRange').value);
}

const gradientMaps = ( function () {

  const threeTone = textureLoader.load( './assets/gradientMaps/threeTone.jpg' );
  threeTone.minFilter = THREE.NearestFilter;
  threeTone.magFilter = THREE.NearestFilter;

  const fiveTone = textureLoader.load( './assets/gradientMaps/fiveTone.jpg' );
  fiveTone.minFilter = THREE.NearestFilter;
  fiveTone.magFilter = THREE.NearestFilter;

  return {
    none: null,
    threeTone: threeTone,
    fiveTone: fiveTone
  };

} )();

const alphaMaps = ( function () {

  const fibers = textureLoader.load( './assets/textures/alphaMap.jpg' );
  fibers.wrapT = THREE.RepeatWrapping;
  fibers.wrapS = THREE.RepeatWrapping;
  fibers.repeat.set( 9, 1 );

  return {
    none: null,
    fibers: fibers
  };

} )();

function loadCanonicalFaceModel() {

  const loader = new THREE.GLTFLoader();

  loader.load(
      './assets/models/canonical_face_model.glb',
      function( gltf ) {

        face = gltf.scene

        mesh = face.children[0].children[0]

        mesh.material.wireframe = true;

        faceGeometry = mesh.geometry

        faceGeometry.setAttribute('uv',
          new THREE.BufferAttribute(new Float32Array(genUVs()), 2));

        const canonTexture = textureLoader.load('./assets/textures/soyjack.png');

        const canonMaterial = new THREE.MeshBasicMaterial({ 
          map: canonTexture,
          side: THREE.DoubleSide});
        
        mesh.material = canonMaterial;

        // or

        // mesh.material.map = canonTexture;

        scene.add(face);

        face.visible = false;

        face.rotation.y += Math.PI;

        face.position.y += 15;
        face.position.z -= 15;

        // face.scale.set(100, 100, 100)

        console.log("face geometry loaded"); //faceGeometry
        

        facePositions = faceGeometry.attributes.position.array;

      },
      function( xhr ) {
        //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },
      function( err ) {
        //console.error( 'An error happened' );
      });

}

function loadCanonicalFaceModelWithTexture() {

  const loader = new THREE.GLTFLoader();

  loader.load(
      './assets/models/canonical_face_with_texture.glb',
      function( gltf ) {


        face = gltf.scene

        scene.add(face);

        // face.rotation.y += Math.PI

        face.position.y += 50;
        
        vertMarker = new THREE.Mesh(vertGeometry, vertMaterial);
        vertMarker.scale.set(10, 10, 10);
        scene.add(vertMarker)
       
        mesh = face.children[2];
        mesh.material.wireframe = true;

        faceGeometry = mesh.geometry

        faceGeometry = mesh.geometry;

      },
      function( xhr ) {
      },
      function( err ) {
        //console.error( 'An error happened' );
      });

}

function loadMaleModel() {

  const loader = new THREE.GLTFLoader();

  loader.load(
      './assets/models/male.glb',
      function( gltf ) {


        obj3D = gltf.scene.children[0]
        assets = obj3D.children

        scene.add(obj3D);

        skinnedMesh = assets[3]

        skeleton = skinnedMesh.skeleton

        bones = skeleton.bones

        skinnedMesh.material = material

        obj3D.rotation.y += Math.PI

        obj3D.scale.set(2, 2, 2)

        obj3D.position.z = 18;
        obj3D.position.x = 11;

        skeletonHelper = new THREE.SkeletonHelper(obj3D);
        skeletonHelper.material.linewidth = 10;
        scene.add(skeletonHelper);

        // initGui();

      },
      function( xhr ) {
        //console.log( (xhr.loaded / xhr.total * 100) + '% loaded' );
      },
      function( err ) {
        //console.error( 'An error happened' );
      });

}

function updateVertexMarker() {
  if (typeof faceGeometry == 'undefined') return;

  facePositions = faceGeometry.attributes.position.array;

  vertMarker.position.x = facePositions[(3*vertexMarker)];
  vertMarker.position.y = facePositions[(3*vertexMarker)+1] + 50;
  vertMarker.position.z = facePositions[(3*vertexMarker)+2];

  vertexMarker++;
}

function drawSphere() {

  const circle = new THREE.SphereGeometry( 15, 32, 16 );

  const canonTexture = textureLoader.load('./assets/textures/canonical-face-texture-photoshop.jpg');
  
  const canonMaterial = new THREE.MeshBasicMaterial({ 
    map: canonTexture,
    side: THREE.DoubleSide});

  const sphere = new THREE.Mesh( circle, canonMaterial );

  scene.add( sphere );
}

function genUVs() {

  const uvs = []

  let k;

  for(k = 0; k < 468; k++) {
    uvs.push(x_uv[mapping[k]]);
    uvs.push(y_uv[mapping[k]]);
  }

  return uvs;

}

function createLooseBody() {

  meshes = []

  let t;

  const canonTexture = textureLoader.load('./assets/textures/clown.png');

  let offset = 0;

  bodyGroup = new THREE.Group();

  const canonMaterial = new THREE.MeshBasicMaterial({ 
    map: canonTexture,
    side: THREE.DoubleSide});

  for(t = 0; t < 33; t++) {
    const geo = new THREE.SphereGeometry(0.4);
    const tracker = new THREE.Mesh(geo, canonMaterial);
    bodyGroup.add(tracker);
    meshes.push(tracker);
  }

  scene.add(bodyGroup);

}

async function drawSkeleton() {
    // loadMaleModel();
    createLooseBody();
    loadCanonicalFaceModel();
    // drawSphere();
}

// Canais de notícias da Rede Social: manchetes por tipo de acontecimento, repercussão das falas dos líderes e notícias de rotina.
// {A} país principal, {B} outro país, {L} líder, {Q} fala citada, {M} resumo do fato, {Y} ano, {N} número.
window.NEWS = {
  ch: [
    { n: 'Eras News', h: 'ErasNews', c: '#c62828', st: 'plantão' },
    { n: 'Jornal do Mundo', h: 'JornalDoMundo', c: '#1565c0', st: 'sério' },
    { n: 'Gazeta Global', h: 'GazetaGlobal', c: '#2e7d32', st: 'sério' },
    { n: 'Canal 24 Horas', h: 'Canal24h', c: '#ef6c00', st: 'plantão' },
    { n: 'Folha Mundial', h: 'FolhaMundial', c: '#37474f', st: 'análise' },
    { n: 'Rádio Planeta', h: 'RadioPlaneta', c: '#6a1b9a', st: 'popular' },
    { n: 'Diário Internacional', h: 'DiarioIntl', c: '#00838f', st: 'sério' },
    { n: 'Bolsa & Mercado', h: 'BolsaMercado', c: '#f9a825', st: 'economia' },
    { n: 'Esporte Total', h: 'EsporteTotal', c: '#43a047', st: 'esporte' },
    { n: 'Fofoca Política', h: 'FofocaPolitica', c: '#d81b60', st: 'fofoca' },
    { n: 'O Observador', h: 'OObservador', c: '#455a64', st: 'análise' },
    { n: 'TV Cartola', h: 'TVCartola', c: '#5d4037', st: 'popular' }
  ],
  pre: { plantão: ['URGENTE:', 'AGORA:', 'PLANTÃO:', 'ÚLTIMA HORA:', 'AO VIVO:'], sério: ['', '', 'Mundo |', 'Internacional |', 'Exclusivo:'], análise: ['Análise:', 'Opinião:', 'Entenda:', 'Por que importa:', ''], popular: ['Olha isso:', 'Você viu?', 'Bomba:', 'Eita:', ''], economia: ['Mercados:', 'Economia:', 'Impacto:', ''], esporte: ['É GOL:', 'Esporte |', 'Placar:', ''], fofoca: ['Babado:', 'Bastidores:', 'Exclusivo:', 'Rolou:'] },
  ev: {
    war: ['{A} declara guerra a {B}', 'Tropas de {A} cruzam a fronteira com {B}', 'Guerra entre {A} e {B}: o que se sabe até agora', 'Conflito aberto: {A} ataca {B}', 'Tensão vira guerra entre {A} e {B}', '{B} sob ataque; {A} confirma ofensiva', 'Mundo reage à guerra entre {A} e {B}', 'Fronteira entre {A} e {B} em chamas', 'Diplomacia falha e {A} parte para cima de {B}', 'Cinco pontos para entender a guerra entre {A} e {B}', 'Moradores fogem da fronteira de {B} após avanço de {A}', 'Exército de {A} mobiliza reservistas contra {B}'],
    dead: ['{A} deixa de existir', 'Fim de uma era: {A} desaparece do mapa', 'Bandeira de {A} é baixada pela última vez', 'O que sobrou de {A}? Entenda a queda', '{A} entra para os livros de história', 'Mapa-múndi perde {A}', 'Queda de {A} muda o equilíbrio da região', 'Últimos dias de {A}: como tudo aconteceu'],
    indep: ['Nasce {A}: nova nação declara independência', '{A} proclama independência', 'Mundo ganha um novo país: {A}', 'Festa nas ruas: {A} é independente', 'Quem é {A}, o país mais novo do mundo', '{A} pede reconhecimento internacional', 'Novo hino, nova bandeira: {A} é oficialmente um país'],
    back: ['{A} está de volta ao mapa', 'Ressurgimento: {A} renasce', 'Volta histórica de {A} surpreende vizinhos', '{A} retorna depois de anos fora do mapa'],
    cup: ['{A} é campeão do mundo!', 'Copa do Mundo: deu {A}', '{A} conquista a taça e o país para', 'Final histórica: {A} levanta a Copa', 'Seleção de {A} faz festa no aeroporto', '{A} campeão: relembre a campanha', 'Torcedores de {A} lotam as praças após o título'],
    oly: ['{A} lidera o quadro de medalhas', 'Olimpíadas: {A} domina os jogos', 'Ouro atrás de ouro: o ano de {A}', 'Fim dos jogos: {A} no topo do pódio', 'Atletas de {A} fazem história'],
    space: ['Corrida espacial: {A} faz história', 'Humanidade dá novo passo com {A}', '{A} vence etapa da corrida espacial', 'Imagens incríveis: a missão de {A}', 'Agência espacial de {A} comemora feito inédito'],
    elec: ['Eleições em {A}: {L} vence', '{L} é o novo líder de {A}', 'Urnas apuradas: vitória de {L} em {A}', '{A} escolhe {L} nas urnas', 'Quem é {L}, eleito em {A}', 'Virada nas urnas: {L} leva {A}', 'Eleição em {A} tem participação recorde'],
    gov: ['Mudança de governo em {A}', 'Golpe em {A}? Entenda o que aconteceu', 'Novo regime assume em {A}', '{A} muda de rumo político', 'Crise institucional em {A}', 'Tanques nas ruas de {A}', 'Comunidade internacional observa {A} com cautela'],
    cat: ['Tragédia em {A}', 'Desastre natural atinge {A}', 'Equipes de resgate chegam a {A}', 'Solidariedade mundial a {A}', '{A} decreta luto oficial', 'Imagens mostram a destruição em {A}'],
    nuke: ['ATAQUE NUCLEAR: {A} usa arma atômica', 'O mundo em choque após decisão de {A}', 'Arma nuclear é usada por {A}; sanções à vista', 'Dia sombrio: {A} cruza a linha nuclear'],
    peace: ['Paz assinada entre {A} e {B}', 'Fim da guerra: {A} e {B} chegam a acordo', 'Tratado encerra conflito entre {A} e {B}', 'Soldados voltam para casa em {A}', 'Acordo de paz redesenha fronteiras de {B}', 'Depois de meses, {A} e {B} param de atirar'],
    unif: ['Unificação: nasce a nova {A}', '{A} se une e vira potência', 'Duas nações, uma bandeira: {A}'],
    spy: ['Escândalo de espionagem envolve {A}', 'Espiões de {A} são descobertos em {B}', '{B} expulsa diplomatas de {A}', 'Caso de espionagem esfria relação entre {A} e {B}'],
    rel: ['{A} muda de religião majoritária', 'Censo revela mudança religiosa em {A}', 'Fé em transformação: o caso de {A}']
  },
  quote: ['{L} ({A}): "{Q}"', '"{Q}", disse {L}, de {A}', 'Em post, {L} afirma: "{Q}"', '{L} reage: "{Q}"', 'Repercute a fala de {L}: "{Q}"', '"{Q}" — {L}, líder de {A}', 'Polêmica: {L} escreveu "{Q}"', 'O que {L} quis dizer com "{Q}"?', 'Analistas comentam a frase de {L}: "{Q}"', 'Viralizou: "{Q}", de {L}'],
  tail: ['', '', '', ' Saiba mais.', ' Veja os detalhes.', ' Acompanhe ao vivo.', ' Leia a análise completa.', ' Veja o vídeo.', ' Entenda o contexto.', ' Fotos.'],
  gen: {
    rank: ['{A} segue como a nação mais poderosa do mundo', 'Ranking mundial: {A} na liderança em {Y}', 'Por que {A} continua no topo?', '{A} amplia vantagem no ranking global', 'Potências de {Y}: {A} lidera e {B} vem logo atrás', 'Disputa pelo topo: {A} e {B} lado a lado'],
    eco: ['Economia de {A} cresce acima do esperado', 'Bolsas sobem com otimismo em {A}', 'Inflação preocupa o governo de {A}', '{A} anuncia pacote de investimentos', 'Comércio entre {A} e {B} bate recorde', 'Desemprego cai em {A}', 'Moeda de {A} se valoriza', 'FMI revisa crescimento de {A}', 'Crise de crédito atinge {A}', 'Preço dos alimentos sobe em {A}'],
    clima: ['Temperatura do planeta está {N} °C acima do normal', 'Cientistas alertam: aquecimento chega a {N} °C', 'Onda de calor bate recordes em {A}', 'Cúpula do clima termina sem acordo', '{A} promete cortar emissões até {Y2}'],
    misc: ['Pesquisa: a maioria em {A} aprova o governo de {L}', 'Popularidade de {L} cai em {A}', '{L} faz viagem oficial a {B}', 'Encontro entre líderes de {A} e {B} termina sem acordo', 'Greve geral paralisa {A}', 'Protestos tomam as ruas de {A}', 'Novo aeroporto é inaugurado em {A}', 'Turismo bate recorde em {A}', '{A} lança satélite de comunicação', 'Festival nacional reúne multidões em {A}', 'Escândalo de corrupção abala {A}', 'Parlamento de {A} aprova reforma polêmica', 'Seleção de {A} anuncia novo técnico', 'Crise diplomática entre {A} e {B}', 'Fronteira entre {A} e {B} volta a ter tensão', '{A} e {B} assinam acordo comercial']
  }
};

// Gera data/nations.js: nacoes historicas adormecidas, cada uma ligada a uma provincia do mapa-mundi.
import fs from 'fs'; import path from 'path';
const DL = path.resolve(process.argv[2]), OUT = path.resolve(import.meta.dirname, '..', 'data');
const { ok, miss } = JSON.parse(fs.readFileSync(path.join(DL, 'nations.raw.json'), 'utf8'));
// lon,lat : tags (posicao aproximada do centro historico)
const REG = `
12.5,41.9:spqr romw alba etru papa
14,37.5:sic sick esi
9,40:sard
9,42:cors
14.3,40.8:amal
11.2,43.8:flor tusc eure kita sien luc pisa
9.7,44.8:parm mode lomb lobb geno mof
12.6,43.7:urb
7.6,45:savo
13.5,46:aqu trre cii
23.7,37.9:athe macc nax more corr theb spar neo epir achh trra
22.5,40.6:macc odry
25,35.2:mino cret
26.2,39.9:troy
27.3,37.9:eph ayd ment srra ser3
28.9,41:byza nica lati
32.5,37.9:rum krrr ram dulk gerr cann ere ertt kids selj
35,39:capa hiit divi
40,39.5:pont treb colc luzi min ajar
44.5,40.2:ura caii baar arm_c arts khh shas
44.8,41.7:kart kakh kaka imer pibe geo_c
49.8,40.4:aze_c shir
44.4,33.3:abba mes suq baby
43.1,36.3:assy mitt mosl cer
39.2,21.5:heja hejz meca qura rash
46.7,24.7:nejd jsh haas anaz daws
47.7,29.4:dilm
50,26:qar
44.2,15.4:himy sheb yem_m rsss zhai
48.5,15.5:hadr mahr thar
45,12.8:aden dhal beih leha fadl
56.3,27.1:orms
36.3,33.5:umayy jaba alle dama syrr alaw
35.5,33.9:pho
35.2,31.8:isr_m gee jaa sdd
38.8,37.1:eds osro comm adi
51.4,35.7:acaa sasa qaja pahl ira_m afsh zand part parh mdi medd saff ghav_x
44.3,37:marh ard boh aqq cara
59.6,36.3:krr tab bav dab
52.5,29.6:fars ss_x
62.2,34.3:durr heph ghur sis
69.2,34.5:kabu afg_m ghav wazz
66.9,39.7:sama samta sog bukh kbu trans bac
60.6,41.5:khiv khwa
71,40.5:koka
69,41.3:uzb_c kyr_c taj_c kaz_c trk_c turr ogh gok
76.9,43.2:kaz_m kark kss
87.6,43.8:uygh uyg yark estt xion tukk
80.9,41.2:cgg
91.1,29.6:tib tib2 tsa kham guge
78.1,32.5:ladh
77.2,28.6:delh mugh sikh brra comi gupt mag push hars ss oudh
85.1,25.6:maur tirh
78.2,17.4:hyb golc satv kakk chal
73.8,18.5:mara khya
76.6,12.3:myso hoys kada kadb chee
80.2,13:chol pall palv vija
78.1,9.9:pand madu
76.2,10:koch malb vvn
80,9.7:jaff
80.7,7.3:kand kott sita ganp
72.6,23:guj khht chav mait
73.7,24.6:mew marw jai dhun nag mewt prat
78.2,23.2:malw gond bage bunh chnd hhad rewk bga bass
88.4,22.6:beng gaud pala
85.8,20.3:ori kal
91.7,26.1:kama aho kamr cacc sady sut koch_x
94.9,21.2:mya_m konb tooo tau ava myin piny saga prro pyu mrau arak hant lawa shan
98.9,18.8:lann hsew
100.5,14.4:ayut lavo ratt sukh hari tha2 phra
99.1,14:mon_x
104.9,11.6:khme funn kemp
102.6,18:lanx vien mup
109.2,15:cham chpp
105.8,21:nguy daiv dongs infro vies
106.7,10.8:vies
101.7,3.1:joho paha max mala
95.3,5.5:aceh pas siak pauu
104.7,-3:sriv
106.8,-6.2:bant duin sunn dem
112.7,-7.5:mhhh kal
119.4,-5.1:maks luwu
116.9,0.5:kuta day borr buly
120.9,14.6:tgg madj bttu tond cebu
121,6:sulu
127.5,-3.7:mall
141,-4:guig guib papb papa_x fpap
126,26.2:ryuk
135.8,35:toku tokuw kamr fuji mina tair hojo take oda clod cldd clda clha clho clna clos clot clou clsa clss clto clu clut adah akam amag asak ashi chos imag ito kyog maed miyo mori nitt roka kihh mats kibi izum yamat shima kanto
143,43:ainu
127,37.5:sok_m gory jos chos_x dumm baky sill gaya mahh jihh bohh gojj okjj tamn
125.7,39:gogg balh buyy
116.4,39.9:ming yuan jind liaa zhou qin hand jin suid tagg sogg nwei ewei wwei wwee weid weis zhao yans qiid chen liu lian shus nany_x xia shang shan_x cao zho zhh jing shun souq hans han
108.9,34.3:qiq qino shaa zhuu shud xind xixi
118.8,32:wudd wuus wuyu chus sons zhos nanz_x taii
113.3,23.1:guan nany yues
100.2,25.6:nanz dall dali_x
103.8,36.1:gans yog xib nin
111.7,40.8:meng inne korc
126.6,45.7:manh tung jurc_x man jian haix jinl feng fent lia kia
106.9,47.9:mon_m khm naim merk oir tann bury
51,55:volg bash tata chuv mari udmm kaza
49,58:perm komi udmm_x
45,43:chec ingu dag kaba adyg cir avv avar alan
47,46.3:khha nago gold greh astra kalm ogh
34.1,44.9:crkh crim thor tamn_x
30.5,50.5:krus kiv cos polr_x gawo pary seve noro done luha ukr_c
24,49.8:pola gali_x gawo
31.3,58.5:nowg
28.3,57.8:pskv polo
30.2,59.9:rus2 mosc
37.6,55.8:rus_c rus3 vlad muro belo tver ryaz odo mord moy mehh
35.9,56.9:yar ros
28,53.9:ber_c bew polo_x
25.3,54.7:lit_m plcr pol2 plsr plsw lit_c sels sei
24.1,56.9:lat_c cour coul curs latg riga lavv lis lio unba coub
24.7,59.4:est_c estd wiek dorp
24.9,60.2:kven tavs kaki
33,65:karr kaaa veps sami bjar
50,65:mans khq koq sya nene nga selk
130,62:khod chuc kamc yup
21,52.2:wars crac pol3 pola_x lubi racz sand maso
17,51.1:sile
18.6,54.3:fcd pome teut prus prud ropr olpr
20.5,54.7:prus2
14.4,50.1:bohe czsl cze
17,49:morg samo
19,47.5:hun_m auhu
16.4,48.2:atr_m auhh_x
11.4,47.3:tyro tyrol
13,47.8:salz
25,45.8:trass dacc
26.1,44.4:wala
28.8,47:mol_c gaga
25,42.7:buls
20.5,44.8:yugo yugo_c ser2 semo srbs rag_x
16,45.8:crsl grcr slok bah3
21.4,42:fyr
13.4,52.5:gerc ger_m ger_f ger_c prus_x brun ger2 weir magd
10.5,51:saxo sax saxe thur meis lusa anh hess dehe herm
11.6,48.1:bava nur aug ans bamb wurz
9.2,48.8:wurt swab ulm mem oett
8.4,49:bade pala sung
8.7,50.1:frc worm mzz trie
6.9,50.9:wepp berg jul cle aac rav detc
9.7,52.4:hano brun bn lun verd olde
10,53.6:ham hols scch meck meks mek obo vele
7.2,53.4:ef fris fri
4.9,52.4:hol net batv nnn netu nets neta gel utr brab barb ubl
3.7,51:flan flan_m wall hain lie bene
6.1,49.6:lux2 lorr lot
7.7,48.6:als sundg
2.3,48.9:fra3 frai frkk wefr efr fral_x ffra rhod_x
.9,44:ant aqu_x gaul aver wasc foix arga
4.8,44:prov awi burg daup auvg rhod lyon
-1.7,48:brit nomm anju orl alen pica berry burb szam
7.3,47:swi2 sue_x hel
-3.7,40.4:spa spa2 spa3 spa4 spa_f andd emgr almm almo casi cast leon arag manc iber visi seu nsp_x
-1,41.6:nava basq laro cant urg
2.2,41.4:cat barc
-3.5,37.2:anda
-8,43:gali astu porg cm
-1.1,38:murr
3,39.6:majj
-8.6,41.2:por3
-9.1,38.7:lusa_x por2
-16.9,32.7:madi
-.1,51.5:eng uni2 wess suss esse kett mecc anxx icen atre cavv cuuu dure brig cvvv
-1.6,55:nort berr
-4,52.8:wal gwyn dyfe dehe_x gwee
-5,50.4:dum corn
-4.2,55.9:sco sco2 sth rhe alba_x nvt vnn pic
-6.3,53.3:ire lein kild conn uls tyr tyrc thom clan des osq not
-4.5,54.2:isee
10.7,59.9:nodm nors nosw nor2 nor3 svea
18.1,59.3:swe2 swq gees gewe gea got jamt
12.6,55.7:deus_x estd_x jut
31.2,30:egyc egyo mamm ayuu ikhs_x
32.5,15.6:madh aneg koss darf_x kush alod maku nabo
24.9,13.2:darf
38.7,9:shew ifat_x idat damo dwar eth_m well hady kaff siem medd_x
38.7,14.1:akss zagg aksu
43,11.5:adal auss afar
45.3,2:ajur moga hobj maje meha warr somb pun jubb
47,9.5:somb
13.2,32.9:trip cery fezz
10.2,36.8:carr hafs alot dje tugg
3,36.7:irid_x fral kaby tlem mzab zir_x
-5,34:mors irid mor2 tafi sijl barh neko sanh mog mor
-8,31.6:akr
-2,18:azaw timb song tuar_x
-8,12.6:mali_x kang sufr takr mess djen mosi
-16,14.7:jolo
-1.6,6.7:asha akon bono golc dagb
2.4,6.4:daho nupe oyo togo togf
8.5,12:haus kano kats zuzz soko bene_x kane
13.2,12:born buny_x kanem_x
7.5,6.5:biaa
9.7,4:camb camd
15.3,-4.3:kong loan soyo conb
14,-9:ndoo kasa yaka
24,-8:lund lubb kaze kuba chok skas
30.1,-2:ruan tuts buha bug_x rwa_m
32.6,.3:bug buny bus ank kitr
39.7,-4:momb mld kilw maji_x yao
39.3,-6.8:zan_m eaff easg tang
35,-13:marv maw2 maka tumb
31,-17.8:mut rozw rho batu mth
28,-28:zulu nata tran boph ciss vend trq soa_m
18.5,-33.9:caq saff_x
17,-22:soag soab domr
47.5,-18.9:maha bets ante anss saka
-99.1,19.4:azte mex2 mex_m tolt tlax tlap toto hua nsp xiut
-96.7,17:zapo mixt
-89.6,20.9:maya mayp itza cocos_x coco tech_x
-90.5,14.6:spg cent grce losa kich pipi lenc
-84,13:moss mikq
-101.7,19.7:tara coli tech
-110,31:apa pima peub hoh mogo navj
-98,35:coma kiow wich osag pawn cadd tex_x
-103,44:siou loka arap chey assi blfo shos
-85,35:cheo crkk choc chic semm
-77,37.5:powh susq lena conf thcv thcm thcd thcpe thcny thcnj
-71.5,42.3:neng thcmb thcnh thcri thcc thir_m pequ mahi aben
-76,43:iroq huro
-85,44:pota illi shaw miam ojib odq mesk
-95,55:cree met
-63,46:miq beth naskq nask
-122,49:sali haid tli chin ktu cas atha
-140,64:inui
-66,18:tii arw cr
-74,4.6:gren grc muis tir sn velp_x pira
-72.5,-13.5:inca cusc wari velp
-77,-9:chim moch naz sicc viru icq waq ch
-68.1,-16.5:tiwa aym quu pacc pebo chhh calh
-57.6,-25:grr pary_x
-58.4,-34.6:arun lll char cals_x
-56.2,-34.9:cis
-70,-38:maqq
-45,-5:tupi poti tapu tuq waur bra_m
-60,-3:arw_x
150,-34:brd muur koor wang noon arre yamm tiwi yong pall
175,-39:maor
-175,-21:tonm ton_m
-157,20:hawa_m
28.9,41.1:tur_m
10,50.5:holy alem cheu marc qua her ruii
47,33:illk qara kard
67,39.6:tim
46,35:sele aca
36.2,33.5:uara abbr zeng
10,36.8:vand vndd
12,45:ost ostr gho gep
19.5,47:huns iza
4.5,47.5:brq
33,46:cum pech sar siq gata antt
34,45.3:bor
6.9,54.5:angl sori
24.5,55:aes
12.5,46.5:cisi
31.3,51.5:cher
21,52:polr
44,42.5:ose samt
70,34:kuss kohq
79,25:chan jau
78,30:garh kanr
73,17:rass kalh radd konk yud
81,17:andh
117,39:baas dais cai ccc daxi dong hens sais yin yons zhon bayi
34,1:ka
-16,18:mau_m
-16,20:wes
-9,4:mell
-73,40.7:weff newf
-85,31:thcca thcg
88,22:fcoo
114.2,22.3:honb
113.5,22.2:map
-109.4,-27.1:rap
79,8:tee
92.3,20.5:rohi
101.5,6.7:pata
116,1:lef
95,51.7:tann_c yeni tath
50,50:mro_x
33.3,35.1:cyn
14.5,35.9:kn
7,49.2:saar
22,48:bukd
1.4,43.6:occa
-4,36:mui mro
9,3.5:spgu
150,8:mic
145.7,15.2:mar
-171,-13.8:samg
`;
const JUNK = new Set('arzt peee kek lebe deus three clko kiv aslr emu sane gr wa susk unnn eunn anta unpp usu thh uso afri sea int ubl libe gond bang jang rhod jeff venr anti paci eaff cas pirl pira'.split(' '));
const pos = new Map(); for (const l of REG.trim().split('\n')) { const i = l.indexOf(':'), [x, y] = l.slice(0, i).split(',').map(Number); l.slice(i + 1).trim().split(/\s+/).forEach(t => { if (!pos.has(t)) pos.set(t, [x, y]); }); }
globalThis.window = {}; const src = fs.readFileSync(path.join(OUT, 'world.js'), 'utf8').replace('window.MAPS=window.MAPS||{};MAPS.world=', 'return '); const W = new Function(src)();
const miller = lat => 1.25 * Math.log(Math.tan(Math.PI / 4 + .4 * lat * Math.PI / 180)), sc = W.W / 360, top = miller(84);
const nearest = (lon, lat) => { const x = (lon + 180) * sc, y = (top - miller(Math.min(84, Math.max(-60, lat)))) * 180 / Math.PI * sc; let b = 0, v = 1e18; W.p.forEach((p, i) => { const d = (p.x - x) ** 2 + (p.y - y) ** 2; if (d < v) { v = d; b = i; } }); return b; };
const cur = new Set(W.nat.map(n => n.n.toLowerCase())); const clean = n => n.replace(/&#0?39;/g, "'");
const out = [], unplaced = [];
for (const v of ok) { if (JUNK.has(v.t) || v.t.startsWith('zb') || cur.has(v.n.toLowerCase())) continue; out.push([clean(v.n), nearest(v.x, v.y)]); }
for (const v of miss) { if (JUNK.has(v.t) || v.t.startsWith('zb') || cur.has(v.n.toLowerCase())) continue; const a = pos.get(v.t); if (a) out.push([clean(v.n), nearest(a[0], a[1])]); else unplaced.push(v.t + '=' + v.n); }
const seen = new Set(), final = out.filter(([n]) => !seen.has(n) && seen.add(n));
fs.writeFileSync(path.join(OUT, 'nations.js'), 'window.HIST_WORLD=' + JSON.stringify(final.map(([n, i]) => [n, W.p[i].x, W.p[i].y])));
console.log('nacoes historicas', final.length, '| sem posicao', unplaced.length); console.log(unplaced.join(' | '));

// perf test for big disjoint union with 1000 cases
type TAction =
{
  type: 'a1',
  a1: number,
} |
{
  type: 'a2',
  a1: number,
} |
{
  type: 'a3',
  a1: number,
} |
{
  type: 'a4',
  a1: number,
} |
{
  type: 'a5',
  a1: number,
} |
{
  type: 'a6',
  a1: number,
} |
{
  type: 'a7',
  a1: number,
} |
{
  type: 'a8',
  a1: number,
} |
{
  type: 'a9',
  a1: number,
} |
{
  type: 'a10',
  a1: number,
} |
{
  type: 'a11',
  a2: number,
} |
{
  type: 'a12',
  a2: number,
} |
{
  type: 'a13',
  a2: number,
} |
{
  type: 'a14',
  a2: number,
} |
{
  type: 'a15',
  a2: number,
} |
{
  type: 'a16',
  a2: number,
} |
{
  type: 'a17',
  a2: number,
} |
{
  type: 'a18',
  a2: number,
} |
{
  type: 'a19',
  a2: number,
} |
{
  type: 'a20',
  a2: number,
} |
{
  type: 'a21',
  a3: number,
} |
{
  type: 'a22',
  a3: number,
} |
{
  type: 'a23',
  a3: number,
} |
{
  type: 'a24',
  a3: number,
} |
{
  type: 'a25',
  a3: number,
} |
{
  type: 'a26',
  a3: number,
} |
{
  type: 'a27',
  a3: number,
} |
{
  type: 'a28',
  a3: number,
} |
{
  type: 'a29',
  a3: number,
} |
{
  type: 'a30',
  a3: number,
} |
{
  type: 'a31',
  a4: number,
} |
{
  type: 'a32',
  a4: number,
} |
{
  type: 'a33',
  a4: number,
} |
{
  type: 'a34',
  a4: number,
} |
{
  type: 'a35',
  a4: number,
} |
{
  type: 'a36',
  a4: number,
} |
{
  type: 'a37',
  a4: number,
} |
{
  type: 'a38',
  a4: number,
} |
{
  type: 'a39',
  a4: number,
} |
{
  type: 'a40',
  a4: number,
} |
{
  type: 'a41',
  a5: number,
} |
{
  type: 'a42',
  a5: number,
} |
{
  type: 'a43',
  a5: number,
} |
{
  type: 'a44',
  a5: number,
} |
{
  type: 'a45',
  a5: number,
} |
{
  type: 'a46',
  a5: number,
} |
{
  type: 'a47',
  a5: number,
} |
{
  type: 'a48',
  a5: number,
} |
{
  type: 'a49',
  a5: number,
} |
{
  type: 'a50',
  a5: number,
} |
{
  type: 'a51',
  a6: number,
} |
{
  type: 'a52',
  a6: number,
} |
{
  type: 'a53',
  a6: number,
} |
{
  type: 'a54',
  a6: number,
} |
{
  type: 'a55',
  a6: number,
} |
{
  type: 'a56',
  a6: number,
} |
{
  type: 'a57',
  a6: number,
} |
{
  type: 'a58',
  a6: number,
} |
{
  type: 'a59',
  a6: number,
} |
{
  type: 'a60',
  a6: number,
} |
{
  type: 'a61',
  a7: number,
} |
{
  type: 'a62',
  a7: number,
} |
{
  type: 'a63',
  a7: number,
} |
{
  type: 'a64',
  a7: number,
} |
{
  type: 'a65',
  a7: number,
} |
{
  type: 'a66',
  a7: number,
} |
{
  type: 'a67',
  a7: number,
} |
{
  type: 'a68',
  a7: number,
} |
{
  type: 'a69',
  a7: number,
} |
{
  type: 'a70',
  a7: number,
} |
{
  type: 'a71',
  a8: number,
} |
{
  type: 'a72',
  a8: number,
} |
{
  type: 'a73',
  a8: number,
} |
{
  type: 'a74',
  a8: number,
} |
{
  type: 'a75',
  a8: number,
} |
{
  type: 'a76',
  a8: number,
} |
{
  type: 'a77',
  a8: number,
} |
{
  type: 'a78',
  a8: number,
} |
{
  type: 'a79',
  a8: number,
} |
{
  type: 'a80',
  a8: number,
} |
{
  type: 'a81',
  a9: number,
} |
{
  type: 'a82',
  a9: number,
} |
{
  type: 'a83',
  a9: number,
} |
{
  type: 'a84',
  a9: number,
} |
{
  type: 'a85',
  a9: number,
} |
{
  type: 'a86',
  a9: number,
} |
{
  type: 'a87',
  a9: number,
} |
{
  type: 'a88',
  a9: number,
} |
{
  type: 'a89',
  a9: number,
} |
{
  type: 'a90',
  a9: number,
} |
{
  type: 'a91',
  a10: number,
} |
{
  type: 'a92',
  a10: number,
} |
{
  type: 'a93',
  a10: number,
} |
{
  type: 'a94',
  a10: number,
} |
{
  type: 'a95',
  a10: number,
} |
{
  type: 'a96',
  a10: number,
} |
{
  type: 'a97',
  a10: number,
} |
{
  type: 'a98',
  a10: number,
} |
{
  type: 'a99',
  a10: number,
} |
{
  type: 'a100',
  a10: number,
} |
{
  type: 'a101',
  a11: number,
} |
{
  type: 'a102',
  a11: number,
} |
{
  type: 'a103',
  a11: number,
} |
{
  type: 'a104',
  a11: number,
} |
{
  type: 'a105',
  a11: number,
} |
{
  type: 'a106',
  a11: number,
} |
{
  type: 'a107',
  a11: number,
} |
{
  type: 'a108',
  a11: number,
} |
{
  type: 'a109',
  a11: number,
} |
{
  type: 'a110',
  a11: number,
} |
{
  type: 'a111',
  a12: number,
} |
{
  type: 'a112',
  a12: number,
} |
{
  type: 'a113',
  a12: number,
} |
{
  type: 'a114',
  a12: number,
} |
{
  type: 'a115',
  a12: number,
} |
{
  type: 'a116',
  a12: number,
} |
{
  type: 'a117',
  a12: number,
} |
{
  type: 'a118',
  a12: number,
} |
{
  type: 'a119',
  a12: number,
} |
{
  type: 'a120',
  a12: number,
} |
{
  type: 'a121',
  a13: number,
} |
{
  type: 'a122',
  a13: number,
} |
{
  type: 'a123',
  a13: number,
} |
{
  type: 'a124',
  a13: number,
} |
{
  type: 'a125',
  a13: number,
} |
{
  type: 'a126',
  a13: number,
} |
{
  type: 'a127',
  a13: number,
} |
{
  type: 'a128',
  a13: number,
} |
{
  type: 'a129',
  a13: number,
} |
{
  type: 'a130',
  a13: number,
} |
{
  type: 'a131',
  a14: number,
} |
{
  type: 'a132',
  a14: number,
} |
{
  type: 'a133',
  a14: number,
} |
{
  type: 'a134',
  a14: number,
} |
{
  type: 'a135',
  a14: number,
} |
{
  type: 'a136',
  a14: number,
} |
{
  type: 'a137',
  a14: number,
} |
{
  type: 'a138',
  a14: number,
} |
{
  type: 'a139',
  a14: number,
} |
{
  type: 'a140',
  a14: number,
} |
{
  type: 'a141',
  a15: number,
} |
{
  type: 'a142',
  a15: number,
} |
{
  type: 'a143',
  a15: number,
} |
{
  type: 'a144',
  a15: number,
} |
{
  type: 'a145',
  a15: number,
} |
{
  type: 'a146',
  a15: number,
} |
{
  type: 'a147',
  a15: number,
} |
{
  type: 'a148',
  a15: number,
} |
{
  type: 'a149',
  a15: number,
} |
{
  type: 'a150',
  a15: number,
} |
{
  type: 'a151',
  a16: number,
} |
{
  type: 'a152',
  a16: number,
} |
{
  type: 'a153',
  a16: number,
} |
{
  type: 'a154',
  a16: number,
} |
{
  type: 'a155',
  a16: number,
} |
{
  type: 'a156',
  a16: number,
} |
{
  type: 'a157',
  a16: number,
} |
{
  type: 'a158',
  a16: number,
} |
{
  type: 'a159',
  a16: number,
} |
{
  type: 'a160',
  a16: number,
} |
{
  type: 'a161',
  a17: number,
} |
{
  type: 'a162',
  a17: number,
} |
{
  type: 'a163',
  a17: number,
} |
{
  type: 'a164',
  a17: number,
} |
{
  type: 'a165',
  a17: number,
} |
{
  type: 'a166',
  a17: number,
} |
{
  type: 'a167',
  a17: number,
} |
{
  type: 'a168',
  a17: number,
} |
{
  type: 'a169',
  a17: number,
} |
{
  type: 'a170',
  a17: number,
} |
{
  type: 'a171',
  a18: number,
} |
{
  type: 'a172',
  a18: number,
} |
{
  type: 'a173',
  a18: number,
} |
{
  type: 'a174',
  a18: number,
} |
{
  type: 'a175',
  a18: number,
} |
{
  type: 'a176',
  a18: number,
} |
{
  type: 'a177',
  a18: number,
} |
{
  type: 'a178',
  a18: number,
} |
{
  type: 'a179',
  a18: number,
} |
{
  type: 'a180',
  a18: number,
} |
{
  type: 'a181',
  a19: number,
} |
{
  type: 'a182',
  a19: number,
} |
{
  type: 'a183',
  a19: number,
} |
{
  type: 'a184',
  a19: number,
} |
{
  type: 'a185',
  a19: number,
} |
{
  type: 'a186',
  a19: number,
} |
{
  type: 'a187',
  a19: number,
} |
{
  type: 'a188',
  a19: number,
} |
{
  type: 'a189',
  a19: number,
} |
{
  type: 'a190',
  a19: number,
} |
{
  type: 'a191',
  a20: number,
} |
{
  type: 'a192',
  a20: number,
} |
{
  type: 'a193',
  a20: number,
} |
{
  type: 'a194',
  a20: number,
} |
{
  type: 'a195',
  a20: number,
} |
{
  type: 'a196',
  a20: number,
} |
{
  type: 'a197',
  a20: number,
} |
{
  type: 'a198',
  a20: number,
} |
{
  type: 'a199',
  a20: number,
} |
{
  type: 'a200',
  a20: number,
} |
{
  type: 'a201',
  a21: number,
} |
{
  type: 'a202',
  a21: number,
} |
{
  type: 'a203',
  a21: number,
} |
{
  type: 'a204',
  a21: number,
} |
{
  type: 'a205',
  a21: number,
} |
{
  type: 'a206',
  a21: number,
} |
{
  type: 'a207',
  a21: number,
} |
{
  type: 'a208',
  a21: number,
} |
{
  type: 'a209',
  a21: number,
} |
{
  type: 'a210',
  a21: number,
} |
{
  type: 'a211',
  a22: number,
} |
{
  type: 'a212',
  a22: number,
} |
{
  type: 'a213',
  a22: number,
} |
{
  type: 'a214',
  a22: number,
} |
{
  type: 'a215',
  a22: number,
} |
{
  type: 'a216',
  a22: number,
} |
{
  type: 'a217',
  a22: number,
} |
{
  type: 'a218',
  a22: number,
} |
{
  type: 'a219',
  a22: number,
} |
{
  type: 'a220',
  a22: number,
} |
{
  type: 'a221',
  a23: number,
} |
{
  type: 'a222',
  a23: number,
} |
{
  type: 'a223',
  a23: number,
} |
{
  type: 'a224',
  a23: number,
} |
{
  type: 'a225',
  a23: number,
} |
{
  type: 'a226',
  a23: number,
} |
{
  type: 'a227',
  a23: number,
} |
{
  type: 'a228',
  a23: number,
} |
{
  type: 'a229',
  a23: number,
} |
{
  type: 'a230',
  a23: number,
} |
{
  type: 'a231',
  a24: number,
} |
{
  type: 'a232',
  a24: number,
} |
{
  type: 'a233',
  a24: number,
} |
{
  type: 'a234',
  a24: number,
} |
{
  type: 'a235',
  a24: number,
} |
{
  type: 'a236',
  a24: number,
} |
{
  type: 'a237',
  a24: number,
} |
{
  type: 'a238',
  a24: number,
} |
{
  type: 'a239',
  a24: number,
} |
{
  type: 'a240',
  a24: number,
} |
{
  type: 'a241',
  a25: number,
} |
{
  type: 'a242',
  a25: number,
} |
{
  type: 'a243',
  a25: number,
} |
{
  type: 'a244',
  a25: number,
} |
{
  type: 'a245',
  a25: number,
} |
{
  type: 'a246',
  a25: number,
} |
{
  type: 'a247',
  a25: number,
} |
{
  type: 'a248',
  a25: number,
} |
{
  type: 'a249',
  a25: number,
} |
{
  type: 'a250',
  a25: number,
} |
{
  type: 'a251',
  a26: number,
} |
{
  type: 'a252',
  a26: number,
} |
{
  type: 'a253',
  a26: number,
} |
{
  type: 'a254',
  a26: number,
} |
{
  type: 'a255',
  a26: number,
} |
{
  type: 'a256',
  a26: number,
} |
{
  type: 'a257',
  a26: number,
} |
{
  type: 'a258',
  a26: number,
} |
{
  type: 'a259',
  a26: number,
} |
{
  type: 'a260',
  a26: number,
} |
{
  type: 'a261',
  a27: number,
} |
{
  type: 'a262',
  a27: number,
} |
{
  type: 'a263',
  a27: number,
} |
{
  type: 'a264',
  a27: number,
} |
{
  type: 'a265',
  a27: number,
} |
{
  type: 'a266',
  a27: number,
} |
{
  type: 'a267',
  a27: number,
} |
{
  type: 'a268',
  a27: number,
} |
{
  type: 'a269',
  a27: number,
} |
{
  type: 'a270',
  a27: number,
} |
{
  type: 'a271',
  a28: number,
} |
{
  type: 'a272',
  a28: number,
} |
{
  type: 'a273',
  a28: number,
} |
{
  type: 'a274',
  a28: number,
} |
{
  type: 'a275',
  a28: number,
} |
{
  type: 'a276',
  a28: number,
} |
{
  type: 'a277',
  a28: number,
} |
{
  type: 'a278',
  a28: number,
} |
{
  type: 'a279',
  a28: number,
} |
{
  type: 'a280',
  a28: number,
} |
{
  type: 'a281',
  a29: number,
} |
{
  type: 'a282',
  a29: number,
} |
{
  type: 'a283',
  a29: number,
} |
{
  type: 'a284',
  a29: number,
} |
{
  type: 'a285',
  a29: number,
} |
{
  type: 'a286',
  a29: number,
} |
{
  type: 'a287',
  a29: number,
} |
{
  type: 'a288',
  a29: number,
} |
{
  type: 'a289',
  a29: number,
} |
{
  type: 'a290',
  a29: number,
} |
{
  type: 'a291',
  a30: number,
} |
{
  type: 'a292',
  a30: number,
} |
{
  type: 'a293',
  a30: number,
} |
{
  type: 'a294',
  a30: number,
} |
{
  type: 'a295',
  a30: number,
} |
{
  type: 'a296',
  a30: number,
} |
{
  type: 'a297',
  a30: number,
} |
{
  type: 'a298',
  a30: number,
} |
{
  type: 'a299',
  a30: number,
} |
{
  type: 'a300',
  a30: number,
} |
{
  type: 'a301',
  a31: number,
} |
{
  type: 'a302',
  a31: number,
} |
{
  type: 'a303',
  a31: number,
} |
{
  type: 'a304',
  a31: number,
} |
{
  type: 'a305',
  a31: number,
} |
{
  type: 'a306',
  a31: number,
} |
{
  type: 'a307',
  a31: number,
} |
{
  type: 'a308',
  a31: number,
} |
{
  type: 'a309',
  a31: number,
} |
{
  type: 'a310',
  a31: number,
} |
{
  type: 'a311',
  a32: number,
} |
{
  type: 'a312',
  a32: number,
} |
{
  type: 'a313',
  a32: number,
} |
{
  type: 'a314',
  a32: number,
} |
{
  type: 'a315',
  a32: number,
} |
{
  type: 'a316',
  a32: number,
} |
{
  type: 'a317',
  a32: number,
} |
{
  type: 'a318',
  a32: number,
} |
{
  type: 'a319',
  a32: number,
} |
{
  type: 'a320',
  a32: number,
} |
{
  type: 'a321',
  a33: number,
} |
{
  type: 'a322',
  a33: number,
} |
{
  type: 'a323',
  a33: number,
} |
{
  type: 'a324',
  a33: number,
} |
{
  type: 'a325',
  a33: number,
} |
{
  type: 'a326',
  a33: number,
} |
{
  type: 'a327',
  a33: number,
} |
{
  type: 'a328',
  a33: number,
} |
{
  type: 'a329',
  a33: number,
} |
{
  type: 'a330',
  a33: number,
} |
{
  type: 'a331',
  a34: number,
} |
{
  type: 'a332',
  a34: number,
} |
{
  type: 'a333',
  a34: number,
} |
{
  type: 'a334',
  a34: number,
} |
{
  type: 'a335',
  a34: number,
} |
{
  type: 'a336',
  a34: number,
} |
{
  type: 'a337',
  a34: number,
} |
{
  type: 'a338',
  a34: number,
} |
{
  type: 'a339',
  a34: number,
} |
{
  type: 'a340',
  a34: number,
} |
{
  type: 'a341',
  a35: number,
} |
{
  type: 'a342',
  a35: number,
} |
{
  type: 'a343',
  a35: number,
} |
{
  type: 'a344',
  a35: number,
} |
{
  type: 'a345',
  a35: number,
} |
{
  type: 'a346',
  a35: number,
} |
{
  type: 'a347',
  a35: number,
} |
{
  type: 'a348',
  a35: number,
} |
{
  type: 'a349',
  a35: number,
} |
{
  type: 'a350',
  a35: number,
} |
{
  type: 'a351',
  a36: number,
} |
{
  type: 'a352',
  a36: number,
} |
{
  type: 'a353',
  a36: number,
} |
{
  type: 'a354',
  a36: number,
} |
{
  type: 'a355',
  a36: number,
} |
{
  type: 'a356',
  a36: number,
} |
{
  type: 'a357',
  a36: number,
} |
{
  type: 'a358',
  a36: number,
} |
{
  type: 'a359',
  a36: number,
} |
{
  type: 'a360',
  a36: number,
} |
{
  type: 'a361',
  a37: number,
} |
{
  type: 'a362',
  a37: number,
} |
{
  type: 'a363',
  a37: number,
} |
{
  type: 'a364',
  a37: number,
} |
{
  type: 'a365',
  a37: number,
} |
{
  type: 'a366',
  a37: number,
} |
{
  type: 'a367',
  a37: number,
} |
{
  type: 'a368',
  a37: number,
} |
{
  type: 'a369',
  a37: number,
} |
{
  type: 'a370',
  a37: number,
} |
{
  type: 'a371',
  a38: number,
} |
{
  type: 'a372',
  a38: number,
} |
{
  type: 'a373',
  a38: number,
} |
{
  type: 'a374',
  a38: number,
} |
{
  type: 'a375',
  a38: number,
} |
{
  type: 'a376',
  a38: number,
} |
{
  type: 'a377',
  a38: number,
} |
{
  type: 'a378',
  a38: number,
} |
{
  type: 'a379',
  a38: number,
} |
{
  type: 'a380',
  a38: number,
} |
{
  type: 'a381',
  a39: number,
} |
{
  type: 'a382',
  a39: number,
} |
{
  type: 'a383',
  a39: number,
} |
{
  type: 'a384',
  a39: number,
} |
{
  type: 'a385',
  a39: number,
} |
{
  type: 'a386',
  a39: number,
} |
{
  type: 'a387',
  a39: number,
} |
{
  type: 'a388',
  a39: number,
} |
{
  type: 'a389',
  a39: number,
} |
{
  type: 'a390',
  a39: number,
} |
{
  type: 'a391',
  a40: number,
} |
{
  type: 'a392',
  a40: number,
} |
{
  type: 'a393',
  a40: number,
} |
{
  type: 'a394',
  a40: number,
} |
{
  type: 'a395',
  a40: number,
} |
{
  type: 'a396',
  a40: number,
} |
{
  type: 'a397',
  a40: number,
} |
{
  type: 'a398',
  a40: number,
} |
{
  type: 'a399',
  a40: number,
} |
{
  type: 'a400',
  a40: number,
} |
{
  type: 'a401',
  a41: number,
} |
{
  type: 'a402',
  a41: number,
} |
{
  type: 'a403',
  a41: number,
} |
{
  type: 'a404',
  a41: number,
} |
{
  type: 'a405',
  a41: number,
} |
{
  type: 'a406',
  a41: number,
} |
{
  type: 'a407',
  a41: number,
} |
{
  type: 'a408',
  a41: number,
} |
{
  type: 'a409',
  a41: number,
} |
{
  type: 'a410',
  a41: number,
} |
{
  type: 'a411',
  a42: number,
} |
{
  type: 'a412',
  a42: number,
} |
{
  type: 'a413',
  a42: number,
} |
{
  type: 'a414',
  a42: number,
} |
{
  type: 'a415',
  a42: number,
} |
{
  type: 'a416',
  a42: number,
} |
{
  type: 'a417',
  a42: number,
} |
{
  type: 'a418',
  a42: number,
} |
{
  type: 'a419',
  a42: number,
} |
{
  type: 'a420',
  a42: number,
} |
{
  type: 'a421',
  a43: number,
} |
{
  type: 'a422',
  a43: number,
} |
{
  type: 'a423',
  a43: number,
} |
{
  type: 'a424',
  a43: number,
} |
{
  type: 'a425',
  a43: number,
} |
{
  type: 'a426',
  a43: number,
} |
{
  type: 'a427',
  a43: number,
} |
{
  type: 'a428',
  a43: number,
} |
{
  type: 'a429',
  a43: number,
} |
{
  type: 'a430',
  a43: number,
} |
{
  type: 'a431',
  a44: number,
} |
{
  type: 'a432',
  a44: number,
} |
{
  type: 'a433',
  a44: number,
} |
{
  type: 'a434',
  a44: number,
} |
{
  type: 'a435',
  a44: number,
} |
{
  type: 'a436',
  a44: number,
} |
{
  type: 'a437',
  a44: number,
} |
{
  type: 'a438',
  a44: number,
} |
{
  type: 'a439',
  a44: number,
} |
{
  type: 'a440',
  a44: number,
} |
{
  type: 'a441',
  a45: number,
} |
{
  type: 'a442',
  a45: number,
} |
{
  type: 'a443',
  a45: number,
} |
{
  type: 'a444',
  a45: number,
} |
{
  type: 'a445',
  a45: number,
} |
{
  type: 'a446',
  a45: number,
} |
{
  type: 'a447',
  a45: number,
} |
{
  type: 'a448',
  a45: number,
} |
{
  type: 'a449',
  a45: number,
} |
{
  type: 'a450',
  a45: number,
} |
{
  type: 'a451',
  a46: number,
} |
{
  type: 'a452',
  a46: number,
} |
{
  type: 'a453',
  a46: number,
} |
{
  type: 'a454',
  a46: number,
} |
{
  type: 'a455',
  a46: number,
} |
{
  type: 'a456',
  a46: number,
} |
{
  type: 'a457',
  a46: number,
} |
{
  type: 'a458',
  a46: number,
} |
{
  type: 'a459',
  a46: number,
} |
{
  type: 'a460',
  a46: number,
} |
{
  type: 'a461',
  a47: number,
} |
{
  type: 'a462',
  a47: number,
} |
{
  type: 'a463',
  a47: number,
} |
{
  type: 'a464',
  a47: number,
} |
{
  type: 'a465',
  a47: number,
} |
{
  type: 'a466',
  a47: number,
} |
{
  type: 'a467',
  a47: number,
} |
{
  type: 'a468',
  a47: number,
} |
{
  type: 'a469',
  a47: number,
} |
{
  type: 'a470',
  a47: number,
} |
{
  type: 'a471',
  a48: number,
} |
{
  type: 'a472',
  a48: number,
} |
{
  type: 'a473',
  a48: number,
} |
{
  type: 'a474',
  a48: number,
} |
{
  type: 'a475',
  a48: number,
} |
{
  type: 'a476',
  a48: number,
} |
{
  type: 'a477',
  a48: number,
} |
{
  type: 'a478',
  a48: number,
} |
{
  type: 'a479',
  a48: number,
} |
{
  type: 'a480',
  a48: number,
} |
{
  type: 'a481',
  a49: number,
} |
{
  type: 'a482',
  a49: number,
} |
{
  type: 'a483',
  a49: number,
} |
{
  type: 'a484',
  a49: number,
} |
{
  type: 'a485',
  a49: number,
} |
{
  type: 'a486',
  a49: number,
} |
{
  type: 'a487',
  a49: number,
} |
{
  type: 'a488',
  a49: number,
} |
{
  type: 'a489',
  a49: number,
} |
{
  type: 'a490',
  a49: number,
} |
{
  type: 'a491',
  a50: number,
} |
{
  type: 'a492',
  a50: number,
} |
{
  type: 'a493',
  a50: number,
} |
{
  type: 'a494',
  a50: number,
} |
{
  type: 'a495',
  a50: number,
} |
{
  type: 'a496',
  a50: number,
} |
{
  type: 'a497',
  a50: number,
} |
{
  type: 'a498',
  a50: number,
} |
{
  type: 'a499',
  a50: number,
} |
{
  type: 'a500',
  a50: number,
} |
{
  type: 'a501',
  a51: number,
} |
{
  type: 'a502',
  a51: number,
} |
{
  type: 'a503',
  a51: number,
} |
{
  type: 'a504',
  a51: number,
} |
{
  type: 'a505',
  a51: number,
} |
{
  type: 'a506',
  a51: number,
} |
{
  type: 'a507',
  a51: number,
} |
{
  type: 'a508',
  a51: number,
} |
{
  type: 'a509',
  a51: number,
} |
{
  type: 'a510',
  a51: number,
} |
{
  type: 'a511',
  a52: number,
} |
{
  type: 'a512',
  a52: number,
} |
{
  type: 'a513',
  a52: number,
} |
{
  type: 'a514',
  a52: number,
} |
{
  type: 'a515',
  a52: number,
} |
{
  type: 'a516',
  a52: number,
} |
{
  type: 'a517',
  a52: number,
} |
{
  type: 'a518',
  a52: number,
} |
{
  type: 'a519',
  a52: number,
} |
{
  type: 'a520',
  a52: number,
} |
{
  type: 'a521',
  a53: number,
} |
{
  type: 'a522',
  a53: number,
} |
{
  type: 'a523',
  a53: number,
} |
{
  type: 'a524',
  a53: number,
} |
{
  type: 'a525',
  a53: number,
} |
{
  type: 'a526',
  a53: number,
} |
{
  type: 'a527',
  a53: number,
} |
{
  type: 'a528',
  a53: number,
} |
{
  type: 'a529',
  a53: number,
} |
{
  type: 'a530',
  a53: number,
} |
{
  type: 'a531',
  a54: number,
} |
{
  type: 'a532',
  a54: number,
} |
{
  type: 'a533',
  a54: number,
} |
{
  type: 'a534',
  a54: number,
} |
{
  type: 'a535',
  a54: number,
} |
{
  type: 'a536',
  a54: number,
} |
{
  type: 'a537',
  a54: number,
} |
{
  type: 'a538',
  a54: number,
} |
{
  type: 'a539',
  a54: number,
} |
{
  type: 'a540',
  a54: number,
} |
{
  type: 'a541',
  a55: number,
} |
{
  type: 'a542',
  a55: number,
} |
{
  type: 'a543',
  a55: number,
} |
{
  type: 'a544',
  a55: number,
} |
{
  type: 'a545',
  a55: number,
} |
{
  type: 'a546',
  a55: number,
} |
{
  type: 'a547',
  a55: number,
} |
{
  type: 'a548',
  a55: number,
} |
{
  type: 'a549',
  a55: number,
} |
{
  type: 'a550',
  a55: number,
} |
{
  type: 'a551',
  a56: number,
} |
{
  type: 'a552',
  a56: number,
} |
{
  type: 'a553',
  a56: number,
} |
{
  type: 'a554',
  a56: number,
} |
{
  type: 'a555',
  a56: number,
} |
{
  type: 'a556',
  a56: number,
} |
{
  type: 'a557',
  a56: number,
} |
{
  type: 'a558',
  a56: number,
} |
{
  type: 'a559',
  a56: number,
} |
{
  type: 'a560',
  a56: number,
} |
{
  type: 'a561',
  a57: number,
} |
{
  type: 'a562',
  a57: number,
} |
{
  type: 'a563',
  a57: number,
} |
{
  type: 'a564',
  a57: number,
} |
{
  type: 'a565',
  a57: number,
} |
{
  type: 'a566',
  a57: number,
} |
{
  type: 'a567',
  a57: number,
} |
{
  type: 'a568',
  a57: number,
} |
{
  type: 'a569',
  a57: number,
} |
{
  type: 'a570',
  a57: number,
} |
{
  type: 'a571',
  a58: number,
} |
{
  type: 'a572',
  a58: number,
} |
{
  type: 'a573',
  a58: number,
} |
{
  type: 'a574',
  a58: number,
} |
{
  type: 'a575',
  a58: number,
} |
{
  type: 'a576',
  a58: number,
} |
{
  type: 'a577',
  a58: number,
} |
{
  type: 'a578',
  a58: number,
} |
{
  type: 'a579',
  a58: number,
} |
{
  type: 'a580',
  a58: number,
} |
{
  type: 'a581',
  a59: number,
} |
{
  type: 'a582',
  a59: number,
} |
{
  type: 'a583',
  a59: number,
} |
{
  type: 'a584',
  a59: number,
} |
{
  type: 'a585',
  a59: number,
} |
{
  type: 'a586',
  a59: number,
} |
{
  type: 'a587',
  a59: number,
} |
{
  type: 'a588',
  a59: number,
} |
{
  type: 'a589',
  a59: number,
} |
{
  type: 'a590',
  a59: number,
} |
{
  type: 'a591',
  a60: number,
} |
{
  type: 'a592',
  a60: number,
} |
{
  type: 'a593',
  a60: number,
} |
{
  type: 'a594',
  a60: number,
} |
{
  type: 'a595',
  a60: number,
} |
{
  type: 'a596',
  a60: number,
} |
{
  type: 'a597',
  a60: number,
} |
{
  type: 'a598',
  a60: number,
} |
{
  type: 'a599',
  a60: number,
} |
{
  type: 'a600',
  a60: number,
} |
{
  type: 'a601',
  a61: number,
} |
{
  type: 'a602',
  a61: number,
} |
{
  type: 'a603',
  a61: number,
} |
{
  type: 'a604',
  a61: number,
} |
{
  type: 'a605',
  a61: number,
} |
{
  type: 'a606',
  a61: number,
} |
{
  type: 'a607',
  a61: number,
} |
{
  type: 'a608',
  a61: number,
} |
{
  type: 'a609',
  a61: number,
} |
{
  type: 'a610',
  a61: number,
} |
{
  type: 'a611',
  a62: number,
} |
{
  type: 'a612',
  a62: number,
} |
{
  type: 'a613',
  a62: number,
} |
{
  type: 'a614',
  a62: number,
} |
{
  type: 'a615',
  a62: number,
} |
{
  type: 'a616',
  a62: number,
} |
{
  type: 'a617',
  a62: number,
} |
{
  type: 'a618',
  a62: number,
} |
{
  type: 'a619',
  a62: number,
} |
{
  type: 'a620',
  a62: number,
} |
{
  type: 'a621',
  a63: number,
} |
{
  type: 'a622',
  a63: number,
} |
{
  type: 'a623',
  a63: number,
} |
{
  type: 'a624',
  a63: number,
} |
{
  type: 'a625',
  a63: number,
} |
{
  type: 'a626',
  a63: number,
} |
{
  type: 'a627',
  a63: number,
} |
{
  type: 'a628',
  a63: number,
} |
{
  type: 'a629',
  a63: number,
} |
{
  type: 'a630',
  a63: number,
} |
{
  type: 'a631',
  a64: number,
} |
{
  type: 'a632',
  a64: number,
} |
{
  type: 'a633',
  a64: number,
} |
{
  type: 'a634',
  a64: number,
} |
{
  type: 'a635',
  a64: number,
} |
{
  type: 'a636',
  a64: number,
} |
{
  type: 'a637',
  a64: number,
} |
{
  type: 'a638',
  a64: number,
} |
{
  type: 'a639',
  a64: number,
} |
{
  type: 'a640',
  a64: number,
} |
{
  type: 'a641',
  a65: number,
} |
{
  type: 'a642',
  a65: number,
} |
{
  type: 'a643',
  a65: number,
} |
{
  type: 'a644',
  a65: number,
} |
{
  type: 'a645',
  a65: number,
} |
{
  type: 'a646',
  a65: number,
} |
{
  type: 'a647',
  a65: number,
} |
{
  type: 'a648',
  a65: number,
} |
{
  type: 'a649',
  a65: number,
} |
{
  type: 'a650',
  a65: number,
} |
{
  type: 'a651',
  a66: number,
} |
{
  type: 'a652',
  a66: number,
} |
{
  type: 'a653',
  a66: number,
} |
{
  type: 'a654',
  a66: number,
} |
{
  type: 'a655',
  a66: number,
} |
{
  type: 'a656',
  a66: number,
} |
{
  type: 'a657',
  a66: number,
} |
{
  type: 'a658',
  a66: number,
} |
{
  type: 'a659',
  a66: number,
} |
{
  type: 'a660',
  a66: number,
} |
{
  type: 'a661',
  a67: number,
} |
{
  type: 'a662',
  a67: number,
} |
{
  type: 'a663',
  a67: number,
} |
{
  type: 'a664',
  a67: number,
} |
{
  type: 'a665',
  a67: number,
} |
{
  type: 'a666',
  a67: number,
} |
{
  type: 'a667',
  a67: number,
} |
{
  type: 'a668',
  a67: number,
} |
{
  type: 'a669',
  a67: number,
} |
{
  type: 'a670',
  a67: number,
} |
{
  type: 'a671',
  a68: number,
} |
{
  type: 'a672',
  a68: number,
} |
{
  type: 'a673',
  a68: number,
} |
{
  type: 'a674',
  a68: number,
} |
{
  type: 'a675',
  a68: number,
} |
{
  type: 'a676',
  a68: number,
} |
{
  type: 'a677',
  a68: number,
} |
{
  type: 'a678',
  a68: number,
} |
{
  type: 'a679',
  a68: number,
} |
{
  type: 'a680',
  a68: number,
} |
{
  type: 'a681',
  a69: number,
} |
{
  type: 'a682',
  a69: number,
} |
{
  type: 'a683',
  a69: number,
} |
{
  type: 'a684',
  a69: number,
} |
{
  type: 'a685',
  a69: number,
} |
{
  type: 'a686',
  a69: number,
} |
{
  type: 'a687',
  a69: number,
} |
{
  type: 'a688',
  a69: number,
} |
{
  type: 'a689',
  a69: number,
} |
{
  type: 'a690',
  a69: number,
} |
{
  type: 'a691',
  a70: number,
} |
{
  type: 'a692',
  a70: number,
} |
{
  type: 'a693',
  a70: number,
} |
{
  type: 'a694',
  a70: number,
} |
{
  type: 'a695',
  a70: number,
} |
{
  type: 'a696',
  a70: number,
} |
{
  type: 'a697',
  a70: number,
} |
{
  type: 'a698',
  a70: number,
} |
{
  type: 'a699',
  a70: number,
} |
{
  type: 'a700',
  a70: number,
} |
{
  type: 'a701',
  a71: number,
} |
{
  type: 'a702',
  a71: number,
} |
{
  type: 'a703',
  a71: number,
} |
{
  type: 'a704',
  a71: number,
} |
{
  type: 'a705',
  a71: number,
} |
{
  type: 'a706',
  a71: number,
} |
{
  type: 'a707',
  a71: number,
} |
{
  type: 'a708',
  a71: number,
} |
{
  type: 'a709',
  a71: number,
} |
{
  type: 'a710',
  a71: number,
} |
{
  type: 'a711',
  a72: number,
} |
{
  type: 'a712',
  a72: number,
} |
{
  type: 'a713',
  a72: number,
} |
{
  type: 'a714',
  a72: number,
} |
{
  type: 'a715',
  a72: number,
} |
{
  type: 'a716',
  a72: number,
} |
{
  type: 'a717',
  a72: number,
} |
{
  type: 'a718',
  a72: number,
} |
{
  type: 'a719',
  a72: number,
} |
{
  type: 'a720',
  a72: number,
} |
{
  type: 'a721',
  a73: number,
} |
{
  type: 'a722',
  a73: number,
} |
{
  type: 'a723',
  a73: number,
} |
{
  type: 'a724',
  a73: number,
} |
{
  type: 'a725',
  a73: number,
} |
{
  type: 'a726',
  a73: number,
} |
{
  type: 'a727',
  a73: number,
} |
{
  type: 'a728',
  a73: number,
} |
{
  type: 'a729',
  a73: number,
} |
{
  type: 'a730',
  a73: number,
} |
{
  type: 'a731',
  a74: number,
} |
{
  type: 'a732',
  a74: number,
} |
{
  type: 'a733',
  a74: number,
} |
{
  type: 'a734',
  a74: number,
} |
{
  type: 'a735',
  a74: number,
} |
{
  type: 'a736',
  a74: number,
} |
{
  type: 'a737',
  a74: number,
} |
{
  type: 'a738',
  a74: number,
} |
{
  type: 'a739',
  a74: number,
} |
{
  type: 'a740',
  a74: number,
} |
{
  type: 'a741',
  a75: number,
} |
{
  type: 'a742',
  a75: number,
} |
{
  type: 'a743',
  a75: number,
} |
{
  type: 'a744',
  a75: number,
} |
{
  type: 'a745',
  a75: number,
} |
{
  type: 'a746',
  a75: number,
} |
{
  type: 'a747',
  a75: number,
} |
{
  type: 'a748',
  a75: number,
} |
{
  type: 'a749',
  a75: number,
} |
{
  type: 'a750',
  a75: number,
} |
{
  type: 'a751',
  a76: number,
} |
{
  type: 'a752',
  a76: number,
} |
{
  type: 'a753',
  a76: number,
} |
{
  type: 'a754',
  a76: number,
} |
{
  type: 'a755',
  a76: number,
} |
{
  type: 'a756',
  a76: number,
} |
{
  type: 'a757',
  a76: number,
} |
{
  type: 'a758',
  a76: number,
} |
{
  type: 'a759',
  a76: number,
} |
{
  type: 'a760',
  a76: number,
} |
{
  type: 'a761',
  a77: number,
} |
{
  type: 'a762',
  a77: number,
} |
{
  type: 'a763',
  a77: number,
} |
{
  type: 'a764',
  a77: number,
} |
{
  type: 'a765',
  a77: number,
} |
{
  type: 'a766',
  a77: number,
} |
{
  type: 'a767',
  a77: number,
} |
{
  type: 'a768',
  a77: number,
} |
{
  type: 'a769',
  a77: number,
} |
{
  type: 'a770',
  a77: number,
} |
{
  type: 'a771',
  a78: number,
} |
{
  type: 'a772',
  a78: number,
} |
{
  type: 'a773',
  a78: number,
} |
{
  type: 'a774',
  a78: number,
} |
{
  type: 'a775',
  a78: number,
} |
{
  type: 'a776',
  a78: number,
} |
{
  type: 'a777',
  a78: number,
} |
{
  type: 'a778',
  a78: number,
} |
{
  type: 'a779',
  a78: number,
} |
{
  type: 'a780',
  a78: number,
} |
{
  type: 'a781',
  a79: number,
} |
{
  type: 'a782',
  a79: number,
} |
{
  type: 'a783',
  a79: number,
} |
{
  type: 'a784',
  a79: number,
} |
{
  type: 'a785',
  a79: number,
} |
{
  type: 'a786',
  a79: number,
} |
{
  type: 'a787',
  a79: number,
} |
{
  type: 'a788',
  a79: number,
} |
{
  type: 'a789',
  a79: number,
} |
{
  type: 'a790',
  a79: number,
} |
{
  type: 'a791',
  a80: number,
} |
{
  type: 'a792',
  a80: number,
} |
{
  type: 'a793',
  a80: number,
} |
{
  type: 'a794',
  a80: number,
} |
{
  type: 'a795',
  a80: number,
} |
{
  type: 'a796',
  a80: number,
} |
{
  type: 'a797',
  a80: number,
} |
{
  type: 'a798',
  a80: number,
} |
{
  type: 'a799',
  a80: number,
} |
{
  type: 'a800',
  a80: number,
} |
{
  type: 'a801',
  a81: number,
} |
{
  type: 'a802',
  a81: number,
} |
{
  type: 'a803',
  a81: number,
} |
{
  type: 'a804',
  a81: number,
} |
{
  type: 'a805',
  a81: number,
} |
{
  type: 'a806',
  a81: number,
} |
{
  type: 'a807',
  a81: number,
} |
{
  type: 'a808',
  a81: number,
} |
{
  type: 'a809',
  a81: number,
} |
{
  type: 'a810',
  a81: number,
} |
{
  type: 'a811',
  a82: number,
} |
{
  type: 'a812',
  a82: number,
} |
{
  type: 'a813',
  a82: number,
} |
{
  type: 'a814',
  a82: number,
} |
{
  type: 'a815',
  a82: number,
} |
{
  type: 'a816',
  a82: number,
} |
{
  type: 'a817',
  a82: number,
} |
{
  type: 'a818',
  a82: number,
} |
{
  type: 'a819',
  a82: number,
} |
{
  type: 'a820',
  a82: number,
} |
{
  type: 'a821',
  a83: number,
} |
{
  type: 'a822',
  a83: number,
} |
{
  type: 'a823',
  a83: number,
} |
{
  type: 'a824',
  a83: number,
} |
{
  type: 'a825',
  a83: number,
} |
{
  type: 'a826',
  a83: number,
} |
{
  type: 'a827',
  a83: number,
} |
{
  type: 'a828',
  a83: number,
} |
{
  type: 'a829',
  a83: number,
} |
{
  type: 'a830',
  a83: number,
} |
{
  type: 'a831',
  a84: number,
} |
{
  type: 'a832',
  a84: number,
} |
{
  type: 'a833',
  a84: number,
} |
{
  type: 'a834',
  a84: number,
} |
{
  type: 'a835',
  a84: number,
} |
{
  type: 'a836',
  a84: number,
} |
{
  type: 'a837',
  a84: number,
} |
{
  type: 'a838',
  a84: number,
} |
{
  type: 'a839',
  a84: number,
} |
{
  type: 'a840',
  a84: number,
} |
{
  type: 'a841',
  a85: number,
} |
{
  type: 'a842',
  a85: number,
} |
{
  type: 'a843',
  a85: number,
} |
{
  type: 'a844',
  a85: number,
} |
{
  type: 'a845',
  a85: number,
} |
{
  type: 'a846',
  a85: number,
} |
{
  type: 'a847',
  a85: number,
} |
{
  type: 'a848',
  a85: number,
} |
{
  type: 'a849',
  a85: number,
} |
{
  type: 'a850',
  a85: number,
} |
{
  type: 'a851',
  a86: number,
} |
{
  type: 'a852',
  a86: number,
} |
{
  type: 'a853',
  a86: number,
} |
{
  type: 'a854',
  a86: number,
} |
{
  type: 'a855',
  a86: number,
} |
{
  type: 'a856',
  a86: number,
} |
{
  type: 'a857',
  a86: number,
} |
{
  type: 'a858',
  a86: number,
} |
{
  type: 'a859',
  a86: number,
} |
{
  type: 'a860',
  a86: number,
} |
{
  type: 'a861',
  a87: number,
} |
{
  type: 'a862',
  a87: number,
} |
{
  type: 'a863',
  a87: number,
} |
{
  type: 'a864',
  a87: number,
} |
{
  type: 'a865',
  a87: number,
} |
{
  type: 'a866',
  a87: number,
} |
{
  type: 'a867',
  a87: number,
} |
{
  type: 'a868',
  a87: number,
} |
{
  type: 'a869',
  a87: number,
} |
{
  type: 'a870',
  a87: number,
} |
{
  type: 'a871',
  a88: number,
} |
{
  type: 'a872',
  a88: number,
} |
{
  type: 'a873',
  a88: number,
} |
{
  type: 'a874',
  a88: number,
} |
{
  type: 'a875',
  a88: number,
} |
{
  type: 'a876',
  a88: number,
} |
{
  type: 'a877',
  a88: number,
} |
{
  type: 'a878',
  a88: number,
} |
{
  type: 'a879',
  a88: number,
} |
{
  type: 'a880',
  a88: number,
} |
{
  type: 'a881',
  a89: number,
} |
{
  type: 'a882',
  a89: number,
} |
{
  type: 'a883',
  a89: number,
} |
{
  type: 'a884',
  a89: number,
} |
{
  type: 'a885',
  a89: number,
} |
{
  type: 'a886',
  a89: number,
} |
{
  type: 'a887',
  a89: number,
} |
{
  type: 'a888',
  a89: number,
} |
{
  type: 'a889',
  a89: number,
} |
{
  type: 'a890',
  a89: number,
} |
{
  type: 'a891',
  a90: number,
} |
{
  type: 'a892',
  a90: number,
} |
{
  type: 'a893',
  a90: number,
} |
{
  type: 'a894',
  a90: number,
} |
{
  type: 'a895',
  a90: number,
} |
{
  type: 'a896',
  a90: number,
} |
{
  type: 'a897',
  a90: number,
} |
{
  type: 'a898',
  a90: number,
} |
{
  type: 'a899',
  a90: number,
} |
{
  type: 'a900',
  a90: number,
} |
{
  type: 'a901',
  a91: number,
} |
{
  type: 'a902',
  a91: number,
} |
{
  type: 'a903',
  a91: number,
} |
{
  type: 'a904',
  a91: number,
} |
{
  type: 'a905',
  a91: number,
} |
{
  type: 'a906',
  a91: number,
} |
{
  type: 'a907',
  a91: number,
} |
{
  type: 'a908',
  a91: number,
} |
{
  type: 'a909',
  a91: number,
} |
{
  type: 'a910',
  a91: number,
} |
{
  type: 'a911',
  a92: number,
} |
{
  type: 'a912',
  a92: number,
} |
{
  type: 'a913',
  a92: number,
} |
{
  type: 'a914',
  a92: number,
} |
{
  type: 'a915',
  a92: number,
} |
{
  type: 'a916',
  a92: number,
} |
{
  type: 'a917',
  a92: number,
} |
{
  type: 'a918',
  a92: number,
} |
{
  type: 'a919',
  a92: number,
} |
{
  type: 'a920',
  a92: number,
} |
{
  type: 'a921',
  a93: number,
} |
{
  type: 'a922',
  a93: number,
} |
{
  type: 'a923',
  a93: number,
} |
{
  type: 'a924',
  a93: number,
} |
{
  type: 'a925',
  a93: number,
} |
{
  type: 'a926',
  a93: number,
} |
{
  type: 'a927',
  a93: number,
} |
{
  type: 'a928',
  a93: number,
} |
{
  type: 'a929',
  a93: number,
} |
{
  type: 'a930',
  a93: number,
} |
{
  type: 'a931',
  a94: number,
} |
{
  type: 'a932',
  a94: number,
} |
{
  type: 'a933',
  a94: number,
} |
{
  type: 'a934',
  a94: number,
} |
{
  type: 'a935',
  a94: number,
} |
{
  type: 'a936',
  a94: number,
} |
{
  type: 'a937',
  a94: number,
} |
{
  type: 'a938',
  a94: number,
} |
{
  type: 'a939',
  a94: number,
} |
{
  type: 'a940',
  a94: number,
} |
{
  type: 'a941',
  a95: number,
} |
{
  type: 'a942',
  a95: number,
} |
{
  type: 'a943',
  a95: number,
} |
{
  type: 'a944',
  a95: number,
} |
{
  type: 'a945',
  a95: number,
} |
{
  type: 'a946',
  a95: number,
} |
{
  type: 'a947',
  a95: number,
} |
{
  type: 'a948',
  a95: number,
} |
{
  type: 'a949',
  a95: number,
} |
{
  type: 'a950',
  a95: number,
} |
{
  type: 'a951',
  a96: number,
} |
{
  type: 'a952',
  a96: number,
} |
{
  type: 'a953',
  a96: number,
} |
{
  type: 'a954',
  a96: number,
} |
{
  type: 'a955',
  a96: number,
} |
{
  type: 'a956',
  a96: number,
} |
{
  type: 'a957',
  a96: number,
} |
{
  type: 'a958',
  a96: number,
} |
{
  type: 'a959',
  a96: number,
} |
{
  type: 'a960',
  a96: number,
} |
{
  type: 'a961',
  a97: number,
} |
{
  type: 'a962',
  a97: number,
} |
{
  type: 'a963',
  a97: number,
} |
{
  type: 'a964',
  a97: number,
} |
{
  type: 'a965',
  a97: number,
} |
{
  type: 'a966',
  a97: number,
} |
{
  type: 'a967',
  a97: number,
} |
{
  type: 'a968',
  a97: number,
} |
{
  type: 'a969',
  a97: number,
} |
{
  type: 'a970',
  a97: number,
} |
{
  type: 'a971',
  a98: number,
} |
{
  type: 'a972',
  a98: number,
} |
{
  type: 'a973',
  a98: number,
} |
{
  type: 'a974',
  a98: number,
} |
{
  type: 'a975',
  a98: number,
} |
{
  type: 'a976',
  a98: number,
} |
{
  type: 'a977',
  a98: number,
} |
{
  type: 'a978',
  a98: number,
} |
{
  type: 'a979',
  a98: number,
} |
{
  type: 'a980',
  a98: number,
} |
{
  type: 'a981',
  a99: number,
} |
{
  type: 'a982',
  a99: number,
} |
{
  type: 'a983',
  a99: number,
} |
{
  type: 'a984',
  a99: number,
} |
{
  type: 'a985',
  a99: number,
} |
{
  type: 'a986',
  a99: number,
} |
{
  type: 'a987',
  a99: number,
} |
{
  type: 'a988',
  a99: number,
} |
{
  type: 'a989',
  a99: number,
} |
{
  type: 'a990',
  a99: number,
} |
{
  type: 'a991',
  a100: number,
} |
{
  type: 'a992',
  a100: number,
} |
{
  type: 'a993',
  a100: number,
} |
{
  type: 'a994',
  a100: number,
} |
{
  type: 'a995',
  a100: number,
} |
{
  type: 'a996',
  a100: number,
} |
{
  type: 'a997',
  a100: number,
} |
{
  type: 'a998',
  a100: number,
} |
{
  type: 'a999',
  a100: number,
} |
{
  type: 'a1000',
  a100: number,
};
function foo(x: TAction): TAction { return x; }

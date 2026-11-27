const messageRepository = require('../repositories/message.repository');
const lessonRepository = require('../repositories/lesson.repository');

const dummyConversations = [
  [
    { fromStudent: true, text: 'Jó napot kívánok! Hozzak valamit az órára?' },
    { fromStudent: false, text: 'Üdvözlöm! Csak a füzetet és egy számológépet hozzon.' },
    { fromStudent: true, text: 'Értettem, köszönöm szépen!' },
    { fromStudent: false, text: 'Szívesen, várni fogom az órán.' }
  ],
  [
    { fromStudent: true, text: 'Egy kérdésem lenne a házi feladattal kapcsolatban.' },
    { fromStudent: false, text: 'Jó napot! Nyugodtan tegye fel, szívesen segítek.' },
    { fromStudent: true, text: 'Köszönöm, az óra elején átbeszélhetjük.' }
  ],
  [
    { fromStudent: true, text: 'Jó napot kívánok! Melyik teremben lesz a konzultáció?' },
    { fromStudent: false, text: 'Üdvözlöm! A 204-es szaktanteremben leszünk.' },
    { fromStudent: true, text: 'Rendben van, köszönöm a tájékoztatást!' }
  ],
  [
    { fromStudent: true, text: 'Üdvözlöm tanár úr! Készüljek valamilyen előzetes feladattal?' },
    { fromStudent: false, text: 'Jó napot! Nem szükséges előre készülni, az alapoktól kezdjük.' },
    { fromStudent: true, text: 'Rendben, nagyon köszönöm!' }
  ],
  [
    { fromStudent: true, text: 'Jó napot kívánok! Lehetséges egy korábbi dolgozatot átismételni?' },
    { fromStudent: false, text: 'Üdvözlöm! Természetesen, hozza magával és kijavítjuk.' },
    { fromStudent: true, text: 'Szuper, köszönöm a lehetőséget!' }
  ],
  [
    { fromStudent: true, text: 'Üdvözlöm! Sikeresen lefoglaltam az időpontot a felkészítőre.' },
    { fromStudent: false, text: 'Jó napot! Örülök a jelentkezésnek, hamarosan találkozunk.' },
    { fromStudent: true, text: 'Viszontlátásra az órán!' }
  ]
];

async function checkEmptyTable() {
  const messageCount = await messageRepository.count();
  if (messageCount === 0) {
    const bookedLessons = (await lessonRepository.findAllBooked()).sort((a, b) => a.ora_ID - b.ora_ID);

    if (!bookedLessons || bookedLessons.length === 0) {
      console.warn('⚠️ Az uzenetek betoltese kimaradt: nincs foglalt ora az adatbazisban.');
      return;
    }

    const targetLessons = bookedLessons.slice(0, 6);
    let totalInserted = 0;

    for (let i = 0; i < targetLessons.length; i++) {
      const lesson = targetLessons[i];
      const conversation = dummyConversations[i % dummyConversations.length];

      for (const msg of conversation) {
        const isStudent = msg.fromStudent;
        await messageRepository.create({
          ora_id: lesson.ora_ID,
          felado_tipus: isStudent ? 'student' : 'teacher',
          felado_id: isStudent ? lesson.diak_id : lesson.tanar_id,
          cimzett_tipus: isStudent ? 'teacher' : 'student',
          cimzett_id: isStudent ? lesson.tanar_id : lesson.diak_id,
          szoveg: msg.text
        });
        totalInserted++;
      }
    }

    console.log(`🌱 ${totalInserted} dummy uzenet sikeresen hozzaadva az adatbazishoz.`);
  }
}

module.exports = {
  checkEmptyTable
};

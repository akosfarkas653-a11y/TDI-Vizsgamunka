# Diák jogosultságú belépési profil
<ol>
<li>Belép.</li>
<li>A főoldalon látja a még szabad órákat.</li>
<li>Külön keres tanárra és tantárgyra.</li>
<li>Lefoglal egy órát, ekkor az állapota függőben lesz.</li>
<li>A dashboardján megtekinti az óráit, és hogy a tanár jóváhagyta-e.</li>
<li>Lemondja a foglalását, a tanár értesítést kap (dátum, időpont, tantárgy, diák neve).</li>
<li>Értesítést kap, amikor a tanár lemondta az óráját (dátum, időpont, tantárgy, tanár neve).</li>
<li>Törli a saját profilját megerősítés után (soft delete).</li>
</ol>

# Tanar jogosultságú belépési profil
<ol>
<li>Belép (az admin által létrehozott fiókkal).</li>
<li>Szabad órákat/időpontokat hirdet meg (tantárggyal, dátummal, idővel).</li>
<li>A dashboardján megnézi a foglalásokat: a foglaló diák nevét és e-mail címét.</li>
<li>Jóváhagyja a diák foglalását.</li>
<li>Töröl/lemond egy órát, a foglaló diák értesítést kap, és az óra „lemondva” állapotot kap.</li>
<li>Értesítést kap, amikor a diák lemondta a foglalást.</li>
<li>Kimutatást néz meg a saját profiljáról: meghirdetett, szabad, függő, jóváhagyott és lemondott órák száma.</li>
</ol>

# Admin jogosultságú belépési profil
<ol>
<li>Belép (külön admin belépés).</li>
<li>Tanár fiókot hoz létre.</li>
<li>Listázza a tanárokat, a diákokat és a foglalt órákat.</li>
<li>Töröl egy tanárt megerősítés után (soft delete). Az óráit is érinti: a szabad órák eltűnnek a diákok elől, a foglaltaknál a diák értesítést kap.</li>
<li>Töröl egy diákot megerősítés után (soft delete). A foglalásai felszabadulnak vagy lemondott állapotot kapnak, a tanár értesítést kap
</li>
<li>Egy kiválasztott tanárnál vagy diáknál listázza az óraszámokat és a foglalt órák listáját.</li>
</ol>
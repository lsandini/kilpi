document.addEventListener('DOMContentLoaded', function() {
    // Collapsible menu handling
    const collapsibles = document.querySelectorAll('.nav-section-title.collapsible');

    collapsibles.forEach(collapsible => {
        collapsible.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('expanded');
        });
    });

    // Toggle all sections button
    const toggleAllBtn = document.getElementById('toggleAllSections');
    if (toggleAllBtn) {
        let allExpanded = false;

        toggleAllBtn.addEventListener('click', function() {
            allExpanded = !allExpanded;
            const toggleIcon = this.querySelector('.toggle-icon');
            const toggleText = this.querySelector('.toggle-text');

            collapsibles.forEach(collapsible => {
                if (allExpanded) {
                    collapsible.classList.add('expanded');
                } else {
                    collapsible.classList.remove('expanded');
                }
            });

            if (allExpanded) {
                toggleIcon.textContent = '⊟';
                toggleText.textContent = 'Sulje kaikki';
            } else {
                toggleIcon.textContent = '⊞';
                toggleText.textContent = 'Avaa kaikki';
            }
        });
    }

    // Navigation handling
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();

            // Remove active class from all nav items and sections
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));

            // Add active class to clicked nav item
            this.classList.add('active');

            // Expand parent section if clicking on a subitem
            if (this.classList.contains('nav-subitem')) {
                const parentSection = this.closest('.nav-section');
                const parentTitle = parentSection.querySelector('.nav-section-title.collapsible');
                if (parentTitle && !parentTitle.classList.contains('expanded')) {
                    parentTitle.classList.add('expanded');
                }
            }

            // Show corresponding section
            const targetId = this.getAttribute('href').substring(1);
            const targetSection = document.getElementById(targetId);
            if (targetSection) {
                targetSection.classList.add('active');
            }
        });
    });

    // Surgical treatment form handling
    const form = document.getElementById('treatmentForm');
    const resultContainer = document.getElementById('result');
    const recommendationDiv = document.getElementById('recommendation');
    const rationaleDiv = document.getElementById('rationale');

    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateRecommendation();
        });

        form.addEventListener('reset', function() {
            resultContainer.style.display = 'none';
        });
    }

    function calculateRecommendation() {
        // Get form values
        const tumorSize = parseInt(document.getElementById('tumorSize').value);
        const tumorType = document.getElementById('tumorType').value;

        // Get selected risk factors
        const riskFactors = Array.from(document.querySelectorAll('input[name="riskFactor"]:checked'))
            .map(cb => cb.value);

        // Determine risk category and recommendation
        const result = determineRecommendation(tumorSize, tumorType, riskFactors);

        // Display results
        displayRecommendation(result, tumorSize, riskFactors);
    }

    function determineRecommendation(size, type, risks) {
        let recommendation = '';
        let category = '';
        let reasoning = [];

        // Check for high-risk factors
        const hasExtrathyroidal = risks.includes('extrathyroidal');
        const hasVascularInvasion = risks.includes('vascular');
        const hasLymphNode = risks.includes('lymphNode');
        const hasBRAF = risks.includes('braf');
        const hasAggressiveHistology = risks.includes('aggressive');
        const hasFamilyHistory = risks.includes('familyHistory');
        const hasRadiation = risks.includes('radiation');
        const hasTrachealContact = risks.includes('trachealContact');

        // Major risk factors that always indicate total thyroidectomy
        const hasMajorRisk = hasExtrathyroidal || hasVascularInvasion ||
                            hasLymphNode || hasAggressiveHistology || hasTrachealContact;

        // Minor risk factors
        const hasMinorRisk = hasBRAF || hasFamilyHistory || hasRadiation;

        // Tumor size categories
        if (size <= 10) {
            category = 'cT1a (≤10 mm)';

            if (!hasMajorRisk && !hasMinorRisk) {
                recommendation = 'Lobektomia tai aktiivinen seuranta';
                reasoning.push('Kasvain on pieni (≤10 mm) ilman riskitekijöitä');
                reasoning.push('Aktiivinen seuranta on vaihtoehto hyvin valituille potilaille');
                reasoning.push('Lobektomia on riittävä hoito matalan riskin tapauksissa');
            } else if (!hasMajorRisk && hasMinorRisk) {
                recommendation = 'Lobektomia (ensisijainen) tai totaaliresektion harkinta';
                reasoning.push('Kasvain on pieni, mutta läsnä on vähäisiä riskitekijöitä');
                if (hasBRAF) reasoning.push('BRAF-mutaatio lisää uusiutumisriskiä');
                if (hasFamilyHistory) reasoning.push('Sukurasitus voi viitata aggressiivisempaan tautiin');
                if (hasRadiation) reasoning.push('Aiempi säteilytys on riskitekijä');
            } else {
                recommendation = 'Totaaliresektio (thyroidektomia)';
                category += ' - korkeampi riski';
                reasoning.push('Kasvain on pieni, mutta läsnä on merkittäviä riskitekijöitä');
                if (hasExtrathyroidal) reasoning.push('Ekstrathyreoidaalinen leviäminen vaatii laajemman leikkauksen');
                if (hasVascularInvasion) reasoning.push('Verisuoniinvaasio lisää etäpesäkeriskiä');
                if (hasLymphNode) reasoning.push('Imusolmuketäyttäyneisyys edellyttää totaaliresektiota');
                if (hasAggressiveHistology) reasoning.push('Aggressiivinen histologia vaatii radikaalimman hoidon');
                if (hasTrachealContact) reasoning.push('Kosketus elintärkeisiin rakenteisiin');
            }

        } else if (size <= 40) {
            category = 'cT1b-T2 (11-40 mm)';

            if (!hasMajorRisk) {
                recommendation = 'Lobektomia';
                reasoning.push('Keskikokoinen kasvain ilman merkittäviä riskitekijöitä');
                reasoning.push('Lobektomia on riittävä, jos ei kosketusta henkitorveen/ruokatorveen/rekurrenshermooon');
                if (hasMinorRisk) {
                    reasoning.push('Huomioi vähäiset riskitekijät seurannassa ja jatkohoitosuunnitelmassa');
                }
            } else {
                recommendation = 'Totaaliresektio (thyroidektomia)';
                category += ' - korkeampi riski';
                reasoning.push('Keskikokoinen kasvain merkittävillä riskitekijöillä');
                if (hasExtrathyroidal) reasoning.push('Ekstrathyreoidaalinen leviäminen');
                if (hasVascularInvasion) reasoning.push('Verisuoniinvaasio');
                if (hasLymphNode) reasoning.push('Imusolmuketäyttäyneisyys - harkitse myös imusolmukedissektiota');
                if (hasAggressiveHistology) reasoning.push('Aggressiivinen histologinen alatyyppi');
                if (hasTrachealContact) reasoning.push('Kosketus henkitorveen/ruokatorveen/rekurrenshermooon');
            }

        } else {
            category = 'cT3-T4 (>40 mm)';
            recommendation = 'Totaaliresektio (thyroidektomia)';
            reasoning.push('Suuri kasvain (>40 mm) edellyttää aina totaaliresektiota');

            if (hasLymphNode) {
                reasoning.push('Imusolmuketäyttäyneisyys - suunnittele imusolmukedissektio');
            }
            if (hasExtrathyroidal) {
                reasoning.push('Ekstrathyreoidaalinen leviäminen - arvioi tarvittavan resektiolaajuus');
            }
            if (hasTrachealContact) {
                reasoning.push('Kosketus kriittisiin rakenteisiin - harkitse moniammatillista konsultaatiota');
            }
        }

        return {
            recommendation: recommendation,
            category: category,
            reasoning: reasoning,
            riskLevel: hasMajorRisk ? 'high-risk' : (hasMinorRisk ? 'warning' : 'low-risk')
        };
    }

    function displayRecommendation(result, size, risks) {
        // Set recommendation text and styling
        recommendationDiv.textContent = result.recommendation;
        recommendationDiv.className = 'recommendation ' + result.riskLevel;

        // Build rationale
        let rationaleHTML = '<h3>Perustelut:</h3>';
        rationaleHTML += '<p><strong>Kasvaimen koko:</strong> ' + size + ' mm (' + result.category + ')</p>';

        if (risks.length > 0) {
            rationaleHTML += '<p><strong>Riskitekijät:</strong></p><ul>';
            risks.forEach(risk => {
                rationaleHTML += '<li>' + getRiskFactorLabel(risk) + '</li>';
            });
            rationaleHTML += '</ul>';
        } else {
            rationaleHTML += '<p><strong>Riskitekijät:</strong> Ei riskitekijöitä</p>';
        }

        rationaleHTML += '<p><strong>Kliininen arviointi:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        // Additional recommendations
        rationaleHTML += '<p><strong>Lisähuomiot:</strong></p><ul>';

        if (result.riskLevel === 'low-risk' && size <= 10) {
            rationaleHTML += '<li>Aktiivinen seuranta on vaihtoehto motivoituneille potilaille</li>';
            rationaleHTML += '<li>Ultraääniseuranta 6-12 kuukauden välein</li>';
        }

        if (risks.includes('lymphNode')) {
            rationaleHTML += '<li>Suunnittele keskuskompartmentin (taso VI) imusolmukedissektio</li>';
            rationaleHTML += '<li>Harkitse lateraalisen kaulan dissektiota, jos N1b</li>';
        }

        if (result.recommendation.includes('Totaaliresektio')) {
            rationaleHTML += '<li>Arvioi radiojodihoitojen tarve leikkauksen jälkeen</li>';
            rationaleHTML += '<li>TSH-suppressiohoito postoperatiivisesti</li>';
        }

        rationaleHTML += '<li>Yksilöllinen hoitosuunnitelma moniammatillisessa tiimissä</li>';
        rationaleHTML += '</ul>';

        rationaleDiv.innerHTML = rationaleHTML;

        // Show results
        resultContainer.style.display = 'block';
        resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function getRiskFactorLabel(value) {
        const labels = {
            'extrathyroidal': 'Ekstrathyreoidaalinen leviäminen',
            'vascular': 'Verisuoniinvaasio',
            'lymphNode': 'Imusolmuketäyttäyneisyys (N+)',
            'braf': 'BRAF-mutaatio',
            'aggressive': 'Aggressiivinen histologia',
            'familyHistory': 'Kilpirauhassyöpä suvussa',
            'radiation': 'Aiempi kaulan säteilytys',
            'trachealContact': 'Kosketus henkitorveen/ruokatorveen/rekurrenshermooon'
        };
        return labels[value] || value;
    }

    // Ultrasound form handling
    const ultrasoundForm = document.getElementById('ultrasoundForm');
    const ultrasoundResultContainer = document.getElementById('ultrasoundResult');
    const ultrasoundRecommendationDiv = document.getElementById('ultrasoundRecommendation');
    const ultrasoundRationaleDiv = document.getElementById('ultrasoundRationale');

    if (ultrasoundForm) {
        ultrasoundForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateUltrasoundRisk();
        });

        ultrasoundForm.addEventListener('reset', function() {
            ultrasoundResultContainer.style.display = 'none';
        });
    }

    function calculateUltrasoundRisk() {
        const size = parseInt(document.getElementById('noduleSize').value);
        const composition = document.getElementById('composition').value;
        const echogenicity = document.getElementById('echogenicity').value;
        const features = Array.from(document.querySelectorAll('input[name="usFeature"]:checked'))
            .map(cb => cb.value);

        const result = determineUltrasoundRisk(size, composition, echogenicity, features);
        displayUltrasoundResult(result, size, composition, echogenicity, features);
    }

    function determineUltrasoundRisk(size, composition, echogenicity, features) {
        let riskLevel = '';
        let riskPercentage = '';
        let fnaRecommendation = '';
        let reasoning = [];

        // Check for high-risk features
        const hasMicroCalc = features.includes('microcalcifications');
        const hasIrregularMargins = features.includes('irregular-margins');
        const hasTallerThanWide = features.includes('taller-than-wide');
        const hasExtrathyroidal = features.includes('extrathyroidal-extension');
        const hasMacroCalc = features.includes('macrocalcifications');
        const hasMultiple = features.includes('multiple-nodules');

        // Pure cystic = benign
        if (composition === 'cystic' || composition === 'honeycomb') {
            riskLevel = 'benign';
            riskPercentage = '<1%';
            fnaRecommendation = 'Ei biopsiaa';
            reasoning.push('Puhtaasti kystinen tai hunajakennomainen rakenne');
            reasoning.push('Maligniteettiriski erittäin pieni');
            if (composition === 'cystic') {
                reasoning.push('Oireista kystaa voi tarvittaessa aspiroida');
            }
        }
        // High-risk features
        else if (hasMicroCalc || hasExtrathyroidal || hasTallerThanWide ||
                (echogenicity === 'markedly-hypo' && hasIrregularMargins)) {
            riskLevel = 'high-risk';
            riskPercentage = '70-90%';

            if (size >= 10) {
                fnaRecommendation = 'FNA suositeltava (≥10 mm)';
            } else if (size >= 5) {
                fnaRecommendation = 'FNA harkittava riskiryhmillä (5-9 mm)';
            } else {
                fnaRecommendation = 'Seuranta suositeltava (<5 mm)';
            }

            reasoning.push('Korkean maligniteettriskin piirteet:');
            if (hasMicroCalc) reasoning.push('• Mikrokalkit - vahva maligniteettiin viittaava merkki');
            if (hasExtrathyroidal) reasoning.push('• Kasvu kilpirauhasen ulkopuolelle');
            if (hasTallerThanWide) reasoning.push('• Korkeampi kuin leveämpi muoto');
            if (hasIrregularMargins) reasoning.push('• Epätarkkarajaiset reunat');
            if (echogenicity === 'markedly-hypo') reasoning.push('• Vahvasti niukkakaikuinen');
        }
        // Moderate risk
        else if (echogenicity === 'mildly-hypo' || hasMacroCalc) {
            riskLevel = 'warning';
            riskPercentage = '10-20%';

            if (composition === 'solid' || composition === 'cystic-solid') {
                if (echogenicity === 'mildly-hypo' && size >= 15) {
                    fnaRecommendation = 'FNA suositeltava (≥15 mm)';
                } else if (size >= 20) {
                    fnaRecommendation = 'FNA suositeltava (≥20 mm)';
                } else {
                    fnaRecommendation = 'Seuranta tai FNA harkittava';
                }
            }

            reasoning.push('Keskimääräisen maligniteettriskin piirteet:');
            if (echogenicity === 'mildly-hypo') reasoning.push('• Lievästi niukkakaikuinen');
            if (hasMacroCalc) reasoning.push('• Makrokalkit läsnä');
            if (hasMultiple) reasoning.push('• Monikyhmystruuma - arvioitava yksitellen');
        }
        // Low risk
        else if (composition === 'cystic-solid') {
            riskLevel = 'low-risk';
            riskPercentage = '<3%';

            if (size >= 20) {
                fnaRecommendation = 'FNA harkittava (≥20 mm)';
            } else {
                fnaRecommendation = 'Ei biopsiaa';
            }

            reasoning.push('Erittäin pienen maligniteettriskin piirteet:');
            reasoning.push('• Kystissolidi muutos ilman korkean riskin piirteitä');
        }
        // Iso/hyperechoic = lower risk
        else if (echogenicity === 'iso' || echogenicity === 'hyper') {
            riskLevel = 'low-risk';
            riskPercentage = '5-10%';

            if (size >= 20) {
                fnaRecommendation = 'FNA suositeltava (≥20 mm)';
            } else {
                fnaRecommendation = 'Kontrolli 12 kk';
            }

            reasoning.push('Pienen maligniteettriskin piirteet:');
            reasoning.push('• Saman- tai runsaskaikuinen rakenne');
            if (size >= 20) reasoning.push('• Koko ≥20 mm - biopsia suositeltava');
        }

        return {
            riskLevel: riskLevel,
            riskPercentage: riskPercentage,
            fnaRecommendation: fnaRecommendation,
            reasoning: reasoning
        };
    }

    function displayUltrasoundResult(result, size, composition, echogenicity, features) {
        ultrasoundRecommendationDiv.textContent = result.fnaRecommendation;
        ultrasoundRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Arvio:</h3>';
        rationaleHTML += '<p><strong>Maligniteettiriski:</strong> ' + result.riskPercentage + '</p>';
        rationaleHTML += '<p><strong>Kyhmyn koko:</strong> ' + size + ' mm</p>';
        rationaleHTML += '<p><strong>Koostumus:</strong> ' + getCompositionLabel(composition) + '</p>';
        rationaleHTML += '<p><strong>Kaikurakenne:</strong> ' + getEchogenicityLabel(echogenicity) + '</p>';

        if (features.length > 0) {
            rationaleHTML += '<p><strong>Ultraäänipiirteet:</strong></p><ul>';
            features.forEach(feature => {
                rationaleHTML += '<li>' + getUSFeatureLabel(feature) + '</li>';
            });
            rationaleHTML += '</ul>';
        }

        rationaleHTML += '<p><strong>Kliininen arviointi:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        rationaleHTML += '<p><strong>Jatkosuositus:</strong></p><ul>';
        rationaleHTML += '<li>' + result.fnaRecommendation + '</li>';
        if (result.riskLevel === 'high-risk' && size < 10) {
            rationaleHTML += '<li>Alle 10 mm vahvasti malignisuspektit kyhmyt: FNA harkittava riskiryhmissä</li>';
            rationaleHTML += '<li>Riskiryhmät: ikä <35v, sukurasitus, aiempi sädehoito, MEN2</li>';
        }
        if (result.riskLevel !== 'benign') {
            rationaleHTML += '<li>Arviointi tapauskohtaisesti ottaen huomioon potilaan ikä ja kliininen tilanne</li>';
        }
        rationaleHTML += '</ul>';

        ultrasoundRationaleDiv.innerHTML = rationaleHTML;
        ultrasoundResultContainer.style.display = 'block';
        ultrasoundResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function getCompositionLabel(value) {
        const labels = {
            'solid': 'Solidi',
            'cystic-solid': 'Kystissolidi',
            'cystic': 'Puhtaasti kystinen',
            'honeycomb': 'Hunajakennomainen'
        };
        return labels[value] || value;
    }

    function getEchogenicityLabel(value) {
        const labels = {
            'markedly-hypo': 'Vahvasti niukkakaikuinen',
            'mildly-hypo': 'Lievästi niukkakaikuinen',
            'iso': 'Samankaikuinen',
            'hyper': 'Runsaskaikuinen'
        };
        return labels[value] || value;
    }

    function getUSFeatureLabel(value) {
        const labels = {
            'microcalcifications': 'Mikrokalkit',
            'macrocalcifications': 'Makrokalkit',
            'irregular-margins': 'Epätarkkarajaiset reunat',
            'taller-than-wide': 'Korkeampi kuin leveämpi',
            'extrathyroidal-extension': 'Kasvu kilpirauhasen ulkopuolelle',
            'multiple-nodules': 'Multippelit kyhmyt'
        };
        return labels[value] || value;
    }

    // FNA form handling
    const fnaForm = document.getElementById('fnaForm');
    const fnaResultContainer = document.getElementById('fnaResult');
    const fnaRecommendationDiv = document.getElementById('fnaRecommendation');
    const fnaRationaleDiv = document.getElementById('fnaRationale');

    if (fnaForm) {
        fnaForm.addEventListener('submit', function(e) {
            e.preventDefault();
            calculateFNAIndication();
        });

        fnaForm.addEventListener('reset', function() {
            fnaResultContainer.style.display = 'none';
        });
    }

    function calculateFNAIndication() {
        const size = parseInt(document.getElementById('fnaNodeSize').value);
        const composition = document.getElementById('fnaComposition').value;
        const age = document.getElementById('patientAge').value ? parseInt(document.getElementById('patientAge').value) : null;
        const features = Array.from(document.querySelectorAll('input[name="fnaFeature"]:checked'))
            .map(cb => cb.value);
        const riskFactors = Array.from(document.querySelectorAll('input[name="riskFactor"]:checked'))
            .map(cb => cb.value);

        const result = determineFNAIndication(size, composition, age, features, riskFactors);
        displayFNAResult(result, size, composition, age, features, riskFactors);
    }

    function determineFNAIndication(size, composition, age, features, riskFactors) {
        let recommendation = '';
        let timing = '';
        let reasoning = [];
        let riskLevel = 'low-risk';

        const hasSuspiciousFeatures = features.length > 0;
        const hasRiskFactors = riskFactors.length > 0;
        const isYoung = age !== null && age < 35;

        // Pure cystic or honeycomb - no FNA
        if (composition === 'cystic' || composition === 'honeycomb') {
            recommendation = 'Ei biopsiaa';
            timing = '';
            reasoning.push('Puhtaasti kystinen tai hunajakennomainen muutos');
            reasoning.push('FNA ei indisoitu');
            reasoning.push('Oireista kystaa voi tarvittaessa aspiroida');
            riskLevel = 'low-risk';
        }
        // Solid with suspicious features
        else if (composition === 'solid-suspicious') {
            if (size >= 10) {
                recommendation = 'FNA suositeltava';
                timing = 'Samalla käynnillä kun mahdollista';
                reasoning.push('Solidi kyhmy malignisuspekteilla piirteillä');
                reasoning.push('Koko ≥10 mm');
                riskLevel = 'high-risk';
            } else if (size >= 5 && (hasRiskFactors || isYoung)) {
                recommendation = 'FNA harkittava';
                timing = 'Riskiryhmä - harkitse biopsiaa';
                reasoning.push('Vahvasti malignisuspekti 5-9 mm kyhmy');
                if (isYoung) reasoning.push('Nuori ikä (<35v) - suurempi maligniteettiriski');
                if (hasRiskFactors) reasoning.push('Riskitekijöitä läsnä');
                riskLevel = 'warning';
            } else {
                recommendation = 'Seuranta tai FNA harkittava';
                timing = 'UÄ-seuranta 6-12 kk, sen jälkeen vuosittain 5v';
                reasoning.push('Malignisuspekti <10 mm kyhmy');
                reasoning.push('Ensisijainen vaihtoehto: aktiivinen seuranta');
                reasoning.push('FNA vaihtoehto motivoituneille potilaille');
                riskLevel = 'warning';
            }
        }
        // Solid mildly hypoechoic
        else if (composition === 'solid-mildly-hypo') {
            if (size >= 15) {
                recommendation = 'FNA suositeltava';
                timing = 'UÄ-ohjatusti';
                reasoning.push('Lievästi niukkakaikuinen solidi kyhmy');
                reasoning.push('Koko ≥15 mm - FNA-kynnys saavutettu');
                riskLevel = 'warning';
            } else if (size >= 10) {
                recommendation = 'UÄ-kontrolli 12 kk tai FNA harkittava';
                timing = 'Tapauskohtainen arvio';
                reasoning.push('Lievästi niukkakaikuinen 10-14 mm kyhmy');
                reasoning.push('Kertakontrolli tai välitön FNA');
                riskLevel = 'low-risk';
            } else {
                recommendation = 'Ei biopsiaa';
                timing = '';
                reasoning.push('Alle 10 mm, ei malignisuspekteja piirteitä');
                riskLevel = 'low-risk';
            }
        }
        // Solid iso/hyperechoic
        else if (composition === 'solid-iso-hyper') {
            if (size >= 20) {
                recommendation = 'FNA suositeltava';
                timing = 'UÄ-ohjatusti';
                reasoning.push('Saman- tai runsaskaikuinen solidi kyhmy');
                reasoning.push('Koko ≥20 mm - FNA-kynnys saavutettu');
                riskLevel = 'low-risk';
            } else if (size >= 15) {
                recommendation = 'UÄ-kontrolli 12 kk';
                timing = 'Kertakontrolli';
                reasoning.push('Saman-/runsaskaikuinen 15-19 mm kyhmy');
                reasoning.push('Kertakontrolli 12 kk kuluttua');
                riskLevel = 'low-risk';
            } else {
                recommendation = 'Ei seurantaa';
                timing = '';
                reasoning.push('Alle 15 mm, ei malignisuspekteja piirteitä');
                riskLevel = 'low-risk';
            }
        }
        // Cystic-solid
        else if (composition === 'cystic-solid') {
            if (hasSuspiciousFeatures && size >= 10) {
                recommendation = 'FNA suositeltava';
                timing = 'Käsitellään kuten solidia niukkakaikuista';
                reasoning.push('Kystissolidi malignisuspekteilla piirteillä solidissa osassa');
                reasoning.push('Koko ≥10 mm');
                riskLevel = 'high-risk';
            } else if (size >= 20) {
                recommendation = 'FNA harkittava';
                timing = 'Tapauskohtainen päätös';
                reasoning.push('Kystissolidi ≥20 mm ilman malignisuspekteja piirteitä');
                reasoning.push('FNA harkittava potilaskohtaisesti');
                riskLevel = 'low-risk';
            } else {
                recommendation = 'Ei biopsiaa / Seuranta harkittava';
                timing = 'UÄ 12-24 kk (harkinta)';
                reasoning.push('Kystissolidi <20 mm ilman malignisuspekteja piirteitä');
                riskLevel = 'low-risk';
            }
        }

        return {
            recommendation: recommendation,
            timing: timing,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayFNAResult(result, size, composition, age, features, riskFactors) {
        fnaRecommendationDiv.textContent = result.recommendation;
        fnaRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Suositus:</h3>';
        rationaleHTML += '<p><strong>FNA-suositus:</strong> ' + result.recommendation + '</p>';
        if (result.timing) {
            rationaleHTML += '<p><strong>Ajoitus:</strong> ' + result.timing + '</p>';
        }
        rationaleHTML += '<p><strong>Kyhmyn koko:</strong> ' + size + ' mm</p>';
        rationaleHTML += '<p><strong>Koostumus:</strong> ' + getFNACompositionLabel(composition) + '</p>';
        if (age !== null) {
            rationaleHTML += '<p><strong>Potilaan ikä:</strong> ' + age + ' vuotta';
            if (age < 35) rationaleHTML += ' (nuori ikä - lisääntynyt riski)';
            rationaleHTML += '</p>';
        }

        if (features.length > 0) {
            rationaleHTML += '<p><strong>Malignisuspektit US-piirteet:</strong></p><ul>';
            features.forEach(feature => {
                rationaleHTML += '<li>' + getFNAFeatureLabel(feature) + '</li>';
            });
            rationaleHTML += '</ul>';
        }

        if (riskFactors.length > 0) {
            rationaleHTML += '<p><strong>Riskitekijät:</strong></p><ul>';
            riskFactors.forEach(rf => {
                rationaleHTML += '<li>' + getFNARiskFactorLabel(rf) + '</li>';
            });
            rationaleHTML += '</ul>';
        }

        rationaleHTML += '<p><strong>Kliininen perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        rationaleHTML += '<p><strong>Lisähuomiot:</strong></p><ul>';
        rationaleHTML += '<li>ONB otetaan UÄ-ohjatusti samalla käynnillä kun mahdollista</li>';
        if (result.riskLevel === 'high-risk') {
            rationaleHTML += '<li>Malignisuspektit piirteet edellyttävät huolellista arviointia</li>';
        }
        if (size < 10 && result.recommendation.includes('Seuranta')) {
            rationaleHTML += '<li>Alle 1 cm kyhmyjen ensisijainen hoito on seuranta</li>';
            rationaleHTML += '<li>UÄ-kontrolli 6-12 kk, sen jälkeen vuosittain 5 vuoden ajan</li>';
        }
        rationaleHTML += '<li>Lopullinen päätös tehdään tapauskohtaisesti huomioiden kliininen tilanne</li>';
        rationaleHTML += '</ul>';

        fnaRationaleDiv.innerHTML = rationaleHTML;
        fnaResultContainer.style.display = 'block';
        fnaResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function getFNACompositionLabel(value) {
        const labels = {
            'solid-suspicious': 'Solidi + malignisuspektit piirteet',
            'solid-mildly-hypo': 'Solidi lievästi niukkakaikuinen',
            'solid-iso-hyper': 'Solidi saman- tai runsaskaikuinen',
            'cystic-solid': 'Kystissolidi',
            'cystic': 'Puhtaasti kystinen',
            'honeycomb': 'Hunajakennomainen'
        };
        return labels[value] || value;
    }

    function getFNAFeatureLabel(value) {
        const labels = {
            'microcalcifications': 'Mikrokalkit',
            'irregular-margins': 'Epätarkkarajaisuus',
            'extrathyroidal': 'Kasvu kilpirauhasen ulkopuolelle',
            'taller-than-wide': 'Korkeampi kuin leveämpi',
            'markedly-hypo': 'Vahvasti niukkakaikuinen'
        };
        return labels[value] || value;
    }

    function getFNARiskFactorLabel(value) {
        const labels = {
            'prior-cancer': 'Aiempi kilpirauhassyöpä',
            'neck-metastases': 'Todetut kaulametastaasit',
            'radiation': 'Aiempi pään/kaulan sädehoito',
            'men2': 'MEN2-syndrooma tai muu riskisyndrooma',
            'family-history': 'Sukuanamnesi (1. asteen sukulainen)'
        };
        return labels[value] || value;
    }

    // Bethesda classification form handling
    const bethesdaForm = document.getElementById('bethesdaForm');
    const bethesdaResultContainer = document.getElementById('bethesdaResult');
    const bethesdaRecommendationDiv = document.getElementById('bethesdaRecommendation');
    const bethesdaRationaleDiv = document.getElementById('bethesdaRationale');

    if (bethesdaForm) {
        bethesdaForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const category = document.getElementById('bethesdaCategory').value;
            const features = Array.from(document.querySelectorAll('input[name="bethesdaFeature"]:checked'))
                .map(cb => cb.value);

            const result = determineBethesdaManagement(category, features);
            displayBethesdaResult(result, category, features);
        });
    }

    function determineBethesdaManagement(category, features) {
        const hasMalignantFeatures = features.length > 0;
        let management = '';
        let timing = '';
        let followUp = '';
        let reasoning = [];
        let riskLevel = 'low-risk';

        switch(category) {
            case '1': // Riittämätön näyte
                if (hasMalignantFeatures) {
                    management = 'UÄ ja ONB-uusinta 0-3 kuukautta';
                    timing = 'Heti kun mahdollista';
                    followUp = 'Jos toistetusti riittämätön, kirurginen hoito (diagnostinen lobektomia)';
                    reasoning.push('Malignisuspektit ultraäänipiirteet läsnä');
                    reasoning.push('Nopea uusinta välttämätön maligniteettiin viittaavien löydösten vuoksi');
                    riskLevel = 'warning';
                } else {
                    management = 'UÄ ja ONB-uusinta 12 kuukautta';
                    timing = 'Vuoden kuluttua';
                    followUp = 'Jos toistetusti riittämätön, UÄ-kontrolli 12 kk, kolmas näyte harvoin tarpeen';
                    reasoning.push('Ei malignisuspekteja ultraäänipiirteitä');
                    reasoning.push('Seuranta mahdollista, jos uusintanäyte ei ole edustava');
                }
                break;

            case '2': // Benigni (0-3%)
                if (hasMalignantFeatures) {
                    management = 'UÄ ja ONB-uusinta 6-12 kuukautta';
                    timing = 'Varmuuden vuoksi uusinta';
                    followUp = 'Jos uusintabiopsia benigni, seuranta päättyy';
                    reasoning.push('Ristiriita: benigni sytologia, mutta malignisuspektit US-piirteet');
                    reasoning.push('Uusintabiopsia suositeltava väärän negatiivisen tuloksen poissulkemiseksi');
                    riskLevel = 'warning';
                } else {
                    management = 'Ei seurantaa';
                    timing = '';
                    followUp = 'Hoidon päätös';
                    reasoning.push('Benigni sytologia ilman malignisuspekteja piirteitä');
                    reasoning.push('Maligniteettiriski <3%');
                    riskLevel = 'benign';
                }
                break;

            case '3': // Merkitykseltään määrittämätön atypia (5-15%)
                if (hasMalignantFeatures) {
                    management = 'UÄ ja ONB-uusinta 6 kuukautta';
                    timing = 'Puolen vuoden kuluttua';
                    followUp = 'Jos sytologinen löydös muuttumaton, kirurginen hoito (diagnostinen lobektomia)';
                    reasoning.push('Atypia + malignisuspektit US-piirteet');
                    reasoning.push('Kohonnut maligniteettiriski 5-15%');
                    reasoning.push('Uusintabiopsia diagnostiseen varmuuteen');
                    riskLevel = 'warning';
                } else {
                    management = 'UÄ ja ONB-uusinta 12 kuukautta';
                    timing = 'Vuoden kuluttua';
                    followUp = 'Jos sytologinen löydös muuttumaton, kirurginen hoito (diagnostinen lobektomia)';
                    reasoning.push('Atypia ilman selkeitä malignisuspekteja piirteitä');
                    reasoning.push('Maligniteettiriski 5-15%');
                }
                break;

            case '4': // Follikulaarinen neoplasia (15-30%)
                management = 'Kirurginen hoito';
                timing = 'Diagnostinen lobektomia';
                followUp = 'Histopatologinen diagnoosi leikkausprepraatista';
                reasoning.push('Follikulaarinen neoplasia - adenoma vs. karsinooma');
                reasoning.push('Maligniteettiriski 15-30%');
                reasoning.push('Erottelu adenoomasta ja karsinoomasta vaatii histologisen näytteen');
                reasoning.push('Lobektomia riittävä diagnostiseen selvitykseen');
                riskLevel = 'warning';
                if (hasMalignantFeatures) {
                    reasoning.push('Malignisuspektit US-piirteet nostavat maligniteettiriskiä');
                }
                break;

            case '5': // Epäily maligniteetista (60-75%)
                management = 'Kirurginen hoito';
                timing = 'Lobektomia tai totaltyreoidektomia';
                followUp = 'Jatkohoidon laajuus riippuu perioperatiivisesta PAD-vastauksesta';
                reasoning.push('Malignisuspekti sytologia');
                reasoning.push('Maligniteettiriski 60-75%');
                reasoning.push('Kirurginen hoito indikoitu');
                reasoning.push('Leikkaustavan valinta perustuu kyhmyn kokoon, sijaintiin ja kliiniseen tilanteeseen');
                riskLevel = 'high-risk';
                if (hasMalignantFeatures) {
                    reasoning.push('Vahvasti malignisuspektit US-piirteet tukevat diagnoosia');
                }
                break;

            case '6': // Maligni (97-99%)
                management = 'Kirurginen hoito';
                timing = 'Totaltyreoidektomia tai lobektomia';
                followUp = 'Jatkohoidon laajuus riippuu PAD-vastauksesta ja riskiluokituksesta';
                reasoning.push('Maligni sytologinen diagnoosi');
                reasoning.push('Maligniteettiriski 97-99%');
                reasoning.push('Kirurginen hoito välttämätön');
                reasoning.push('Totaltyreoidektomia suositeltava, jos:');
                reasoning.push('  - Kyhmy >4 cm');
                reasoning.push('  - Bilateraaliset kyhmyt');
                reasoning.push('  - Kliinisesti ilmeinen metastaasi');
                reasoning.push('  - Kasvu kilpirauhasen ulkopuolelle');
                reasoning.push('Lobektomia mahdollinen pienillä, yksipuolisilla kyhmyillä ilman metastasointia');
                riskLevel = 'high-risk';
                break;

            default:
                management = 'Virhe kategorian valinnassa';
                reasoning.push('Valitse Bethesda-kategoria');
        }

        return {
            management: management,
            timing: timing,
            followUp: followUp,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayBethesdaResult(result, category, features) {
        bethesdaRecommendationDiv.textContent = result.management;
        bethesdaRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Jatkohoito:</h3>';
        rationaleHTML += '<p><strong>Bethesda-kategoria:</strong> ' + getBethesdaCategoryLabel(category) + '</p>';
        rationaleHTML += '<p><strong>Suositus:</strong> ' + result.management + '</p>';

        if (result.timing) {
            rationaleHTML += '<p><strong>Ajoitus/Laajuus:</strong> ' + result.timing + '</p>';
        }

        if (result.followUp) {
            rationaleHTML += '<p><strong>Jatkoseuranta:</strong> ' + result.followUp + '</p>';
        }

        if (features.length > 0) {
            rationaleHTML += '<p><strong>Ultraäänipiirteet:</strong></p><ul>';
            features.forEach(feature => {
                rationaleHTML += '<li>' + getBethesdaFeatureLabel(feature) + '</li>';
            });
            rationaleHTML += '</ul>';
        } else {
            rationaleHTML += '<p><strong>Ultraäänipiirteet:</strong> Ei malignisuspekteja piirteitä</p>';
        }

        rationaleHTML += '<p><strong>Kliininen perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        rationaleHTML += '<p><strong>Huomioitavaa:</strong></p><ul>';
        rationaleHTML += '<li>Jatkohoidon tarve arvioidaan yksilöllisesti</li>';
        rationaleHTML += '<li>Otettava huomioon potilaan ikä, perussairaudet ja kliininen tilanne</li>';
        rationaleHTML += '<li>Epäselvissä tapauksissa konsultoi alueellista asiantuntijaa</li>';
        rationaleHTML += '</ul>';

        bethesdaRationaleDiv.innerHTML = rationaleHTML;
        bethesdaResultContainer.style.display = 'block';
        bethesdaResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function getBethesdaCategoryLabel(value) {
        const labels = {
            '1': 'I - Riittämätön näyte',
            '2': 'II - Benigni (0-3%)',
            '3': 'III - Merkitykseltään määrittämätön atypia (5-15%)',
            '4': 'IV - Follikulaarinen neoplasia (15-30%)',
            '5': 'V - Epäily maligniteetista (60-75%)',
            '6': 'VI - Maligni (97-99%)'
        };
        return labels[value] || value;
    }

    function getBethesdaFeatureLabel(value) {
        const labels = {
            'microcalcifications': 'Mikrokalkit',
            'irregular-margins': 'Epätarkkarajaisuus',
            'extrathyroidal': 'Kasvu kilpirauhasen ulkopuolelle',
            'taller-than-wide': 'Korkeampi kuin leveämpi',
            'markedly-hypo': 'Vahvasti niukkakaikuinen (< strap-lihas)'
        };
        return labels[value] || value;
    }

    // Incidental findings form handling
    const incidentalForm = document.getElementById('incidentalForm');
    const incidentalResultContainer = document.getElementById('incidentalResult');
    const incidentalRecommendationDiv = document.getElementById('incidentalRecommendation');
    const incidentalRationaleDiv = document.getElementById('incidentalRationale');

    if (incidentalForm) {
        incidentalForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const size = parseInt(document.getElementById('incidentalSize').value);
            const composition = document.getElementById('incidentalComposition').value;
            const ageInput = document.getElementById('incidentalAge').value;
            const age = ageInput ? parseInt(ageInput) : null;
            const features = Array.from(document.querySelectorAll('input[name="incidentalFeature"]:checked'))
                .map(cb => cb.value);
            const riskGroup = document.querySelector('input[name="incidentalRisk"]:checked') !== null;

            const result = determineIncidentalManagement(size, composition, age, features, riskGroup);
            displayIncidentalResult(result, size, composition, age, features, riskGroup);
        });
    }

    function determineIncidentalManagement(size, composition, age, features, riskGroup) {
        const hasMalignantFeatures = features.length > 0;
        const isYoung = age !== null && age < 35;
        const isRiskGroup = riskGroup || isYoung;

        let surveillance = '';
        let timing = '';
        let reasoning = [];
        let riskLevel = 'low-risk';

        // < 1 cm nodules with malignant features
        if (size < 10 && hasMalignantFeatures) {
            if (isRiskGroup) {
                surveillance = 'UÄ-kontrolli 6-12 kuukautta tai FNA-harkinta';
                timing = 'Ensimmäinen kontrolli 6-12 kk, sen jälkeen vuosittain 5 vuoden ajan';
                reasoning.push('Alle 1 cm kyhmy malignisuspekteilla piirteillä');
                reasoning.push('Riskiryhmä - FNA voi olla aiheellinen');
                reasoning.push('Papillaariset mikrokarsinoomat kasvavat hitaasti');
                reasoning.push('Seuranta on ensisijainen vaihtoehto hyvän ennusteen vuoksi');
                riskLevel = 'warning';
            } else {
                surveillance = 'UÄ-seuranta suositeltava';
                timing = 'UÄ-kontrolli 6-12 kk, sen jälkeen vuosittain 5 vuoden ajan';
                reasoning.push('Alle 1 cm kyhmy malignisuspekteilla piirteillä (solidi, niukkakaikuinen, mikrokalkit)');
                reasoning.push('Papillaariset mikrokarsinoomat kasvavat hitaasti - hyvä ennuste');
                reasoning.push('Ensisijainen hoito on seuranta');
                reasoning.push('Ei rauhasen ulkopuoliseen kasvuun tai metastasointiin viittaavaa');
                riskLevel = 'warning';
            }
        }
        // < 1 cm nodules without malignant features
        else if (size < 10 && !hasMalignantFeatures) {
            if (composition === 'solid-hypo-mild') {
                surveillance = 'Ei seurantaa';
                timing = '';
                reasoning.push('Alle 1 cm solidi lievästi niukkakaikuinen ilman malignisuspekteja piirteitä');
                reasoning.push('Ei seurantaa tarvita');
                riskLevel = 'benign';
            } else {
                surveillance = 'Ei seurantaa';
                timing = '';
                reasoning.push('Alle 1 cm kyhmy ilman malignisuspekteja piirteitä');
                reasoning.push('Ei kontrollin tarvetta');
                riskLevel = 'benign';
            }
        }
        // ≥ 1 cm solid mildly hypoechoic
        else if (size >= 10 && composition === 'solid-hypo-mild' && !hasMalignantFeatures) {
            surveillance = 'UÄ-kontrolli 12 kuukautta';
            timing = 'Kertakontrolli vuoden kuluttua';
            reasoning.push('Solidi ≥1 cm lievästi niukkakaikuinen ilman maligneja piirteitä');
            reasoning.push('Ei täytä biopsiakriteeriä');
            reasoning.push('Suositellaan kontrolloitavaksi kerran vuoden kuluttua');
            riskLevel = 'low-risk';
        }
        // ≥ 1.5 cm solid iso/hyperechoic
        else if (size >= 15 && composition === 'solid-iso-hyper' && !hasMalignantFeatures) {
            surveillance = 'UÄ-kontrolli 12 kuukautta';
            timing = 'Kertakontrolli vuoden kuluttua';
            reasoning.push('Solidi ≥1.5 cm saman- tai runsaskaikuinen ilman maligneja piirteitä');
            reasoning.push('Ei täytä biopsiakriteeriä');
            reasoning.push('Suositellaan kontrolloitavaksi kerran vuoden kuluttua');
            riskLevel = 'low-risk';
        }
        // < 1.5 cm solid iso/hyperechoic without malignant features
        else if (size < 15 && composition === 'solid-iso-hyper' && !hasMalignantFeatures) {
            surveillance = 'Ei seurantaa';
            timing = '';
            reasoning.push('Alle 1.5 cm solidi saman- tai runsaskaikuinen ilman maligneja piirteitä');
            reasoning.push('Ei seurantaa tarvita');
            riskLevel = 'benign';
        }
        // Cystic-solid < 2 cm
        else if (size < 20 && composition === 'cystic-solid' && !hasMalignantFeatures) {
            surveillance = 'Ei seurantaa';
            timing = '';
            reasoning.push('Kystissolidi alle 2 cm ilman malignisuspekteja piirteitä');
            reasoning.push('Ei seurantaa tarvita');
            riskLevel = 'benign';
        }
        // Cystic-solid ≥ 2 cm
        else if (size >= 20 && composition === 'cystic-solid' && !hasMalignantFeatures) {
            surveillance = 'UÄ-kontrolli 12-24 kuukautta (harkinta)';
            timing = 'Kertakontrolli - tapauskohtainen päätös';
            reasoning.push('Kystissolidi ≥2 cm ilman malignisuspekteja piirteitä');
            reasoning.push('UÄ-kontrolli voidaan harkita');
            riskLevel = 'low-risk';
        }
        // Pure cystic
        else if (composition === 'cystic') {
            surveillance = 'Ei seurantaa';
            timing = '';
            reasoning.push('Puhtaasti kystinen muutos');
            reasoning.push('Voi sisältää sakkaa, kolloidikiteitä tai hunajakennorakennetta');
            reasoning.push('Ei seurantaa tarvita');
            riskLevel = 'benign';
        }
        // Nodules with malignant features ≥ 1 cm
        else if (hasMalignantFeatures) {
            surveillance = 'FNA suositeltava';
            timing = 'Kyhmyn koko ja piirteet täyttävät biopsiakriteerin';
            reasoning.push('Malignisuspektit ultraäänipiirteet läsnä');
            reasoning.push('Kyhmyn koko ' + size + ' mm');
            reasoning.push('FNA indikoitu malignisuspektien piirteiden perusteella');
            riskLevel = 'high-risk';
        }
        // Default
        else {
            surveillance = 'Tapauskohtainen arvio';
            timing = 'Arvioidaan yksilöllisesti';
            reasoning.push('Kyhmyn ominaisuudet vaativat yksilöllistä harkintaa');
            reasoning.push('Konsultoi tarvittaessa alueellista asiantuntijaa');
            riskLevel = 'low-risk';
        }

        return {
            surveillance: surveillance,
            timing: timing,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayIncidentalResult(result, size, composition, age, features, riskGroup) {
        incidentalRecommendationDiv.textContent = result.surveillance;
        incidentalRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Seuranta:</h3>';
        rationaleHTML += '<p><strong>Suositus:</strong> ' + result.surveillance + '</p>';

        if (result.timing) {
            rationaleHTML += '<p><strong>Ajoitus:</strong> ' + result.timing + '</p>';
        }

        rationaleHTML += '<p><strong>Kyhmyn koko:</strong> ' + size + ' mm</p>';
        rationaleHTML += '<p><strong>Kaikurakenne:</strong> ' + getIncidentalCompositionLabel(composition) + '</p>';

        if (age !== null) {
            rationaleHTML += '<p><strong>Potilaan ikä:</strong> ' + age + ' vuotta';
            if (age < 35) {
                rationaleHTML += ' (riskiryhmä)';
            }
            rationaleHTML += '</p>';
        }

        if (riskGroup) {
            rationaleHTML += '<p><strong>Riskiryhmä:</strong> Kyllä</p>';
        }

        if (features.length > 0) {
            rationaleHTML += '<p><strong>Malignisuspektit piirteet:</strong></p><ul>';
            features.forEach(feature => {
                rationaleHTML += '<li>' + getIncidentalFeatureLabel(feature) + '</li>';
            });
            rationaleHTML += '</ul>';
        } else {
            rationaleHTML += '<p><strong>Malignisuspektit piirteet:</strong> Ei havaittu</p>';
        }

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        rationaleHTML += '<p><strong>Seurannassa huomioitavaa:</strong></p><ul>';
        rationaleHTML += '<li>Kasvu ≥20% (vähintään ≥2 mm) kahdessa suunnassa on aihe ONB:lle tai jatkoseurannalle</li>';
        rationaleHTML += '<li>Tilavuuden muutos >50% on aihe jatkoselvityksille</li>';
        rationaleHTML += '<li>UÄ-piirteiden muutos maligniksi on aihe ONB:lle</li>';
        rationaleHTML += '</ul>';

        incidentalRationaleDiv.innerHTML = rationaleHTML;
        incidentalResultContainer.style.display = 'block';
        incidentalResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function getIncidentalCompositionLabel(value) {
        const labels = {
            'solid-hypo-mild': 'Solidi lievästi niukkakaikuinen',
            'solid-iso-hyper': 'Solidi saman- tai runsaskaikuinen',
            'cystic-solid': 'Kystissolidi',
            'cystic': 'Puhtaasti kystinen'
        };
        return labels[value] || value;
    }

    function getIncidentalFeatureLabel(value) {
        const labels = {
            'microcalcifications': 'Mikrokalkit',
            'irregular-margins': 'Epätarkkarajaisuus',
            'extrathyroidal': 'Kasvu kilpirauhasen ulkopuolelle',
            'taller-than-wide': 'Korkeampi kuin leveämpi',
            'markedly-hypo': 'Vahvasti niukkakaikuinen'
        };
        return labels[value] || value;
    }

    // Calcium management form handling
    const calciumForm = document.getElementById('calciumForm');
    const calciumResultContainer = document.getElementById('calciumResult');
    const calciumRecommendationDiv = document.getElementById('calciumRecommendation');
    const calciumRationaleDiv = document.getElementById('calciumRationale');

    if (calciumForm) {
        calciumForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const calcium = parseFloat(document.getElementById('calciumLevel').value);
            const pthInput = document.getElementById('pthLevel').value;
            const pth = pthInput ? parseFloat(pthInput) : null;

            const result = determineCalciumManagement(calcium, pth);
            displayCalciumResult(result, calcium, pth);
        });
    }

    function determineCalciumManagement(calcium, pth) {
        let recommendation = '';
        let dosing = '';
        let followUp = '';
        let reasoning = [];
        let riskLevel = 'low-risk';

        // Severe hypocalcemia - do not discharge
        if (calcium < 1.05) {
            recommendation = 'Ei kotiutusta - aloita aktiivinen D-vitamiini';
            dosing = 'Kalsium-D-vitamiini 2×2 + Alfakalsidoli 0.5 µg × 2';
            followUp = 'Ionisoitunut kalsium joka aamu. Kotiutus vasta kun Ca++ ≥ 1.05 mmol/l';
            reasoning.push('Vaikea hypokalsemia (Ca++ < 1.05 mmol/l)');
            reasoning.push('Potilasta ei saa kotiuttaa');
            reasoning.push('Alfakalsidoli aloitetaan kalsium-D-vitamiinin rinnalle');
            if (pth !== null && pth < 0.58) {
                reasoning.push('PTH erittäin matala - pysyvän hypoparatyreoosin riski kohonnut');
            }
            reasoning.push('Vaikean hypokalsemian yhteydessä voidaan tarvita kalsiuminfuusiota');
            riskLevel = 'high-risk';
        }
        // Mild hypocalcemia
        else if (calcium >= 1.05 && calcium <= 1.15) {
            recommendation = 'Kalsium-D-vitamiinikorvaus, seuranta erikoissairaanhoidossa';
            dosing = 'Kalsium-D-vitamiini 2×2';
            followUp = 'Ohjaus endokrinologian poliklinikalle 1-3 viikon sisällä';
            reasoning.push('Lievä hypokalsemia (Ca++ 1.05-1.15 mmol/l)');
            reasoning.push('Kotiutus mahdollinen kalsiumlisällä');
            if (pth !== null) {
                if (pth < 0.58) {
                    reasoning.push('PTH matala - harkitse alfakalsidolin aloitusta');
                    riskLevel = 'warning';
                } else if (pth > 1.06) {
                    reasoning.push('PTH normaali - lisäkilpirauhasen toiminta todennäköisesti palautuu');
                }
            }
            riskLevel = 'warning';
        }
        // Low-normal calcium
        else if (calcium > 1.15 && calcium <= 1.30) {
            recommendation = 'Profylaktinen kalsium-D-vitamiinivalmiste';
            dosing = 'Kalsium-D-vitamiini 1×1-2';
            followUp = 'Kontrolli omalla terveysasemalla 1-2 kk kuluttua';
            reasoning.push('Kalsium viitealueen alarajalla (Ca++ 1.16-1.30 mmol/l)');
            reasoning.push('Profylaktinen korvaus suositeltava');
            if (pth !== null && pth > 1.06) {
                reasoning.push('PTH normaali - hyvä ennuste lisäkilpirauhasen toiminnalle');
            }
            riskLevel = 'low-risk';
        }
        // Normal calcium
        else {
            recommendation = 'Ei kalsiumlisää tarvita';
            dosing = 'Ei lääkitystä';
            followUp = 'Normaali seuranta';
            reasoning.push('Kalsium normaali (Ca++ > 1.30 mmol/l)');
            reasoning.push('Ei tarvetta kalsiumkorvaukselle');
            if (pth !== null && pth > 1.06) {
                reasoning.push('PTH normaali - lisäkilpirauhasen toiminta säilynyt');
            }
            riskLevel = 'benign';
        }

        // PTH-specific warnings
        if (pth !== null) {
            if (pth < 0.58 && calcium >= 1.05) {
                reasoning.push('HUOM: Matala PTH viittaa hypoparatyreoosiriskiin - tihennetty seuranta');
            }
        }

        return {
            recommendation: recommendation,
            dosing: dosing,
            followUp: followUp,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayCalciumResult(result, calcium, pth) {
        calciumRecommendationDiv.textContent = result.recommendation;
        calciumRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Hoito-ohje:</h3>';
        rationaleHTML += '<p><strong>Ca++ (ionisoutunut):</strong> ' + calcium.toFixed(2) + ' mmol/l</p>';
        if (pth !== null) {
            rationaleHTML += '<p><strong>PTH:</strong> ' + pth.toFixed(2) + ' pmol/l</p>';
        }
        rationaleHTML += '<p><strong>Lääkitys:</strong> ' + result.dosing + '</p>';
        rationaleHTML += '<p><strong>Seuranta:</strong> ' + result.followUp + '</p>';

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        rationaleHTML += '<p><strong>Lääkevaihtoehtoja:</strong></p><ul>';
        rationaleHTML += '<li>Kalsium-D-vitamiinivalmisteet: Ideos®, Kalcipos®, Calci-Chew D3 Forte®, Minisun Calcium®</li>';
        rationaleHTML += '<li>Aktiivinen D-vitamiini: Alfakalsidoli (Etalpha® tai geneerinen)</li>';
        rationaleHTML += '</ul>';

        rationaleHTML += '<p><strong>Muistettavaa:</strong></p><ul>';
        rationaleHTML += '<li>Tyroksiini tulee ottaa vähintään 4 tuntia ennen kalsiumvalmistetta</li>';
        if (result.riskLevel === 'high-risk') {
            rationaleHTML += '<li>Mittaa myös plasman magnesiumpitoisuus vaikean hypokalsemian yhteydessä</li>';
        }
        rationaleHTML += '</ul>';

        calciumRationaleDiv.innerHTML = rationaleHTML;
        calciumResultContainer.style.display = 'block';
        calciumResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // TNM Staging form handling
    const tnmForm = document.getElementById('tnmForm');
    const tnmResultContainer = document.getElementById('tnmResult');
    const tnmRecommendationDiv = document.getElementById('tnmRecommendation');
    const tnmRationaleDiv = document.getElementById('tnmRationale');

    if (tnmForm) {
        tnmForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const age = parseInt(document.getElementById('tnmAge').value);
            const tClass = document.getElementById('tClass').value;
            const nClass = document.getElementById('nClass').value;
            const mClass = document.getElementById('mClass').value;

            const result = determineTNMStage(age, tClass, nClass, mClass);
            displayTNMResult(result, age, tClass, nClass, mClass);
        });
    }

    function determineTNMStage(age, t, n, m) {
        let stage = '';
        let stageDescription = '';
        let reasoning = [];
        let riskLevel = 'low-risk';

        const isYoung = age < 55;
        const hasMetastasis = m === 'M1';
        const hasLymphNode = n === 'N1a' || n === 'N1b';

        // T category parsing
        const isT1 = t === 'T1a' || t === 'T1b';
        const isT2 = t === 'T2';
        const isT3 = t === 'T3a' || t === 'T3b';
        const isT4a = t === 'T4a';
        const isT4b = t === 'T4b';

        if (isYoung) {
            // Age < 55 years - only Stage I or II
            if (hasMetastasis) {
                stage = 'II';
                stageDescription = 'Levinneisyysaste II (ikä <55v, M1)';
                reasoning.push('Potilas alle 55-vuotias');
                reasoning.push('Etäpesäkkeitä todettu (M1)');
                reasoning.push('Alle 55-vuotiailla vain asteet I ja II');
                riskLevel = 'warning';
            } else {
                stage = 'I';
                stageDescription = 'Levinneisyysaste I (ikä <55v, M0)';
                reasoning.push('Potilas alle 55-vuotias');
                reasoning.push('Ei etäpesäkkeitä (M0)');
                reasoning.push('Alle 55-vuotiailla ilman etäpesäkkeitä aina aste I');
                reasoning.push('Ennuste erinomainen iästä riippumatta T- tai N-luokasta');
                riskLevel = 'benign';
            }
        } else {
            // Age >= 55 years
            if (hasMetastasis) {
                stage = 'IVB';
                stageDescription = 'Levinneisyysaste IVB (ikä ≥55v, M1)';
                reasoning.push('Potilas 55-vuotias tai vanhempi');
                reasoning.push('Etäpesäkkeitä todettu (M1)');
                riskLevel = 'high-risk';
            } else if (isT4b) {
                stage = 'IVA';
                stageDescription = 'Levinneisyysaste IVA (ikä ≥55v, T4b)';
                reasoning.push('Potilas 55-vuotias tai vanhempi');
                reasoning.push('Laaja paikallinen leviäminen (T4b)');
                reasoning.push('Kasvu prevertebraalifaskiaan, carotis-valtimon ympäri tai mediastinaalisiin suoniin');
                riskLevel = 'high-risk';
            } else if (isT4a) {
                stage = 'III';
                stageDescription = 'Levinneisyysaste III (ikä ≥55v, T4a)';
                reasoning.push('Potilas 55-vuotias tai vanhempi');
                reasoning.push('Paikallisesti edennyt tauti (T4a)');
                reasoning.push('Kasvu ihonalaisiin pehmytkudoksiin, kurkunpäähän, henkitorveen, ruokatorveen tai recurrens-hermoon');
                riskLevel = 'high-risk';
            } else if (isT3 || hasLymphNode) {
                stage = 'II';
                stageDescription = 'Levinneisyysaste II (ikä ≥55v)';
                reasoning.push('Potilas 55-vuotias tai vanhempi');
                if (isT3) reasoning.push('Suuri kasvain (T3: >4 cm) tai kasvu ympäröiviin lihaksiin');
                if (hasLymphNode) reasoning.push('Imusolmukemetastaaseja todettu (' + n + ')');
                riskLevel = 'warning';
            } else {
                stage = 'I';
                stageDescription = 'Levinneisyysaste I (ikä ≥55v, T1-2 N0)';
                reasoning.push('Potilas 55-vuotias tai vanhempi');
                reasoning.push('Pieni/keskikokoinen kasvain (≤4 cm)');
                reasoning.push('Ei imusolmukemetastaaseja');
                reasoning.push('Ei etäpesäkkeitä');
                riskLevel = 'benign';
            }
        }

        return {
            stage: stage,
            stageDescription: stageDescription,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayTNMResult(result, age, t, n, m) {
        tnmRecommendationDiv.textContent = result.stageDescription;
        tnmRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>TNM-luokitus:</h3>';
        rationaleHTML += '<p><strong>Ikä:</strong> ' + age + ' vuotta';
        if (age < 55) {
            rationaleHTML += ' (alle 55-vuotias)';
        } else {
            rationaleHTML += ' (55-vuotias tai vanhempi)';
        }
        rationaleHTML += '</p>';
        rationaleHTML += '<p><strong>T-luokka:</strong> ' + t + '</p>';
        rationaleHTML += '<p><strong>N-luokka:</strong> ' + n + '</p>';
        rationaleHTML += '<p><strong>M-luokka:</strong> ' + m + '</p>';
        rationaleHTML += '<p><strong>Levinneisyysaste:</strong> ' + result.stage + '</p>';

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        rationaleHTML += '<p><strong>Ennuste ja hoito:</strong></p><ul>';
        if (result.stage === 'I') {
            rationaleHTML += '<li>Erinomainen ennuste</li>';
            rationaleHTML += '<li>5-vuotiselossaoloennuste >98%</li>';
        } else if (result.stage === 'II') {
            rationaleHTML += '<li>Hyvä ennuste</li>';
            rationaleHTML += '<li>Tihennetty seuranta suositeltava</li>';
        } else if (result.stage === 'III' || result.stage === 'IVA') {
            rationaleHTML += '<li>Kohtalainen ennuste</li>';
            rationaleHTML += '<li>Moniammatillinen arvio suositeltava</li>';
            rationaleHTML += '<li>Radiojodihoito todennäköisesti aiheellinen</li>';
        } else if (result.stage === 'IVB') {
            rationaleHTML += '<li>Vaativa tilanne - moniammatillinen arvio välttämätön</li>';
            rationaleHTML += '<li>Hoitovaste riippuu etäpesäkkeiden radiojodiherkyydestä</li>';
        }
        rationaleHTML += '</ul>';

        tnmRationaleDiv.innerHTML = rationaleHTML;
        tnmResultContainer.style.display = 'block';
        tnmResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Risk Stratification form handling
    const riskForm = document.getElementById('riskForm');
    const riskResultContainer = document.getElementById('riskResult');
    const riskRecommendationDiv = document.getElementById('riskRecommendation');
    const riskRationaleDiv = document.getElementById('riskRationale');

    if (riskForm) {
        riskForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const tumorSize = parseInt(document.getElementById('riskTumorSize').value);
            const features = Array.from(document.querySelectorAll('input[name="riskFeature"]:checked'))
                .map(cb => cb.value);

            const result = determineRiskCategory(tumorSize, features);
            displayRiskResult(result, tumorSize, features);
        });
    }

    function determineRiskCategory(tumorSize, features) {
        let riskCategory = 'low';
        let riskDescription = '';
        let raiRecommendation = '';
        let raiDose = '';
        let reasoning = [];
        let highRiskFeatures = [];
        let intermediateRiskFeatures = [];

        // Define high-risk features
        const highRisk = ['macroMargin', 'macroExtrathyroidal', 'vascular4plus', 'widelyInvasive',
                         'poorlyDiff', 'largeMeta', 'extracapsular', 'distantMeta'];

        // Define intermediate-risk features
        const intermediateRisk = ['extrathyroidal', 'vascular13', 'aggressive', 'braf2cm',
                                  'macroMeta', 'microMeta5'];

        // Check for high-risk features
        features.forEach(f => {
            if (highRisk.includes(f)) {
                highRiskFeatures.push(f);
            } else if (intermediateRisk.includes(f)) {
                intermediateRiskFeatures.push(f);
            }
        });

        // Large tumor is intermediate risk
        if (tumorSize > 40) {
            intermediateRiskFeatures.push('largeTumor');
        }

        // Determine risk category
        if (highRiskFeatures.length > 0) {
            riskCategory = 'high';
            riskDescription = 'KORKEA RISKI (uusimisriski >30%)';
            raiRecommendation = 'Radiojodihoito suositeltava';
            raiDose = '3.7 GBq';
            reasoning.push('Korkean riskin piirteitä todettu');
        } else if (intermediateRiskFeatures.length > 0) {
            riskCategory = 'intermediate';
            riskDescription = 'KOHTALAINEN RISKI (uusimisriski 6-30%)';
            raiRecommendation = 'Radiojodihoito suositeltava';
            raiDose = '3.7 GBq';
            reasoning.push('Kohtalaisen riskin piirteitä todettu');
        } else {
            riskCategory = 'low';
            riskDescription = 'MATALA RISKI (uusimisriski <6%)';
            if (tumorSize < 10) {
                raiRecommendation = 'Radiojodihoitoa ei tarvita';
                raiDose = 'Ei hoitoa';
                reasoning.push('<1 cm matalan riskin kasvain ei vaadi radiojodihoitoa');
            } else {
                raiRecommendation = 'Radiojodihoito yleensä ei tarvita, seuranta riittää';
                raiDose = 'Tarvittaessa 1.1 GBq';
                reasoning.push('1-4 cm matalan riskin kasvaimissa radiojodin voi jättää antamatta');
                reasoning.push('Edellytykset: tyreoglobuliini <0.2 µg/l ja vasta-ainetaso normaali');
            }
        }

        // Add specific feature reasons
        const featureLabels = {
            'macroMargin': 'Makroskooppinen marginaalipositiivisuus',
            'macroExtrathyroidal': 'Makroskooppinen kasvu kilpirauhasen ulkopuolelle',
            'vascular4plus': 'Verisuoni-invaasio ≥4 suonessa',
            'widelyInvasive': 'Laajasti invasiivinen karsinooma',
            'poorlyDiff': 'Huonosti erilaistunut karsinooma',
            'largeMeta': 'Suuri (>30 mm) imusolmukemetastaasi',
            'extracapsular': 'Ekstrakapsulaarinen kasvu imusolmukkeessa',
            'distantMeta': 'Etäpesäkkeet',
            'extrathyroidal': 'Mikroskooppinen kasvu kilpirauhasen ulkopuolelle',
            'vascular13': 'Verisuoni-invaasio (1-3 suonessa)',
            'aggressive': 'Aggressiivinen histologia ≥1 cm kasvaimessa',
            'braf2cm': 'BRAF V600E -mutaatio ≥2 cm kasvaimessa',
            'macroMeta': 'Makrometastaasi imusolmukkeessa',
            'microMeta5': 'Mikrometastaaseja ≥5 imusolmukkeessa',
            'largeTumor': 'Kasvain >4 cm'
        };

        highRiskFeatures.forEach(f => {
            reasoning.push('Korkean riskin piirre: ' + featureLabels[f]);
        });

        intermediateRiskFeatures.forEach(f => {
            reasoning.push('Kohtalaisen riskin piirre: ' + featureLabels[f]);
        });

        return {
            riskCategory: riskCategory,
            riskDescription: riskDescription,
            raiRecommendation: raiRecommendation,
            raiDose: raiDose,
            reasoning: reasoning,
            highRiskFeatures: highRiskFeatures,
            intermediateRiskFeatures: intermediateRiskFeatures
        };
    }

    function displayRiskResult(result, tumorSize, features) {
        riskRecommendationDiv.textContent = result.riskDescription;

        if (result.riskCategory === 'high') {
            riskRecommendationDiv.className = 'recommendation high-risk';
        } else if (result.riskCategory === 'intermediate') {
            riskRecommendationDiv.className = 'recommendation warning';
        } else {
            riskRecommendationDiv.className = 'recommendation benign';
        }

        let rationaleHTML = '<h3>Arviointi:</h3>';
        rationaleHTML += '<p><strong>Kasvaimen koko:</strong> ' + tumorSize + ' mm</p>';
        rationaleHTML += '<p><strong>Riskiluokka:</strong> ' + result.riskDescription + '</p>';
        rationaleHTML += '<p><strong>Radiojodihoitosuositus:</strong> ' + result.raiRecommendation + '</p>';
        rationaleHTML += '<p><strong>Radiojodiannos:</strong> ' + result.raiDose + '</p>';

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        // Add treatment considerations
        rationaleHTML += '<p><strong>Hoitosuunnittelussa huomioitavaa:</strong></p><ul>';
        if (result.riskCategory === 'high') {
            rationaleHTML += '<li>Radiojodihoito 3.7 GBq suositeltava vasta-aiheiden puuttuessa</li>';
            rationaleHTML += '<li>TSH-stimulaatio rhTSH-valmisteella tai tyroksiinitauolla</li>';
            rationaleHTML += '<li>Vähäjodinen ruokavalio 2 viikkoa ennen hoitoa</li>';
            if (features.includes('poorlyDiff')) {
                rationaleHTML += '<li>HUOM: Huonosti erilaistuneet karsinoomat reagoivat usein huonommin radiojodiin - ulkoisen sädehoidon tarve arvioitava</li>';
            }
        } else if (result.riskCategory === 'intermediate') {
            rationaleHTML += '<li>Radiojodihoito 3.7 GBq lähtökohtaisesti suositeltava</li>';
            rationaleHTML += '<li>Poikkeustapauksissa seuranta mahdollinen, jos tyreoglobuliini stabiili <2 µg/l</li>';
            rationaleHTML += '<li>TSH-stimulaatio suositeltava rhTSH-valmisteella</li>';
        } else {
            rationaleHTML += '<li>Postoperatiivinen tyreoglobuliini tarkistettava (tavoite <0.2 µg/l)</li>';
            rationaleHTML += '<li>Tyreoglobuliinivasta-aineet tarkistettava</li>';
            rationaleHTML += '<li>Jos Tg 0.2-2 µg/l: kontrolli 2 kk kuluttua</li>';
            rationaleHTML += '<li>Jos Tg >2 µg/l tai vasta-aineet koholla: harkitse radiojodia 1.1 GBq</li>';
        }
        rationaleHTML += '</ul>';

        riskRationaleDiv.innerHTML = rationaleHTML;
        riskResultContainer.style.display = 'block';
        riskResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Response Assessment form handling (6.1)
    const responseForm = document.getElementById('responseForm');
    const responseResultContainer = document.getElementById('responseResult');
    const responseRecommendationDiv = document.getElementById('responseRecommendation');
    const responseRationaleDiv = document.getElementById('responseRationale');

    if (responseForm) {
        responseForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const hadRAI = document.querySelector('input[name="hadRAI"]:checked').value;
            const suppressedTg = parseFloat(document.getElementById('suppressedTg').value);
            const stimulatedTgInput = document.getElementById('stimulatedTg').value;
            const stimulatedTg = stimulatedTgInput ? parseFloat(stimulatedTgInput) : null;
            const tgAb = document.querySelector('input[name="tgAb"]:checked').value;
            const ultrasound = document.querySelector('input[name="ultrasound"]:checked').value;

            const result = determineResponseCategory(hadRAI, suppressedTg, stimulatedTg, tgAb, ultrasound);
            displayResponseResult(result, suppressedTg, stimulatedTg, tgAb, ultrasound);
        });

        responseForm.addEventListener('reset', function() {
            responseResultContainer.style.display = 'none';
        });
    }

    function determineResponseCategory(hadRAI, suppressedTg, stimulatedTg, tgAb, ultrasound) {
        let category = '';
        let recommendation = '';
        let riskLevel = 'low-risk';
        let reasoning = [];

        // Structural disease takes priority
        if (ultrasound === 'positive') {
            category = 'Mitattavaa tautia jäljellä';
            recommendation = 'Yksilöllinen hoitosuunnitelma (kirurgia, RAI, sädehoito, lääkehoito)';
            riskLevel = 'high-risk';
            reasoning.push('Kuvantamisessa selvä tauti');
            reasoning.push('Hoito suunnitellaan moniammatillisesti');
        }
        // Rising TgAb is concerning
        else if (tgAb === 'rising') {
            category = 'Biokemiallinen epätäydellinen vaste';
            recommendation = 'Uusinta radiojodihoito yleensä perusteltu';
            riskLevel = 'high-risk';
            reasoning.push('TgAb nousussa viittaa aktiiviseen tautiin');
            reasoning.push('Nouseva TgAb on indikaatio radiojodihoidolle');
        }
        // Check Tg levels based on RAI status
        else if (hadRAI === 'yes') {
            // Post-RAI assessment
            if (ultrasound === 'normal' && tgAb === 'negative') {
                if (suppressedTg < 0.2 && (stimulatedTg === null || stimulatedTg < 1)) {
                    category = 'Erinomainen vaste';
                    recommendation = 'Seuranta, ei uusintahoitoja. Uusimisriski <2%';
                    riskLevel = 'benign';
                    reasoning.push('UÄ normaali, Tg matala, TgAb negatiivinen');
                } else if (suppressedTg <= 1 || (stimulatedTg !== null && stimulatedTg <= 10)) {
                    category = 'Epävarma tilanne';
                    recommendation = 'Ei uusintahoitoa, mutta tiivis seuranta';
                    riskLevel = 'warning';
                    reasoning.push('Tg-taso epävarmalla alueella');
                } else {
                    category = 'Biokemiallinen epätäydellinen vaste';
                    recommendation = 'Uusinta radiojodihoito yleensä perusteltu';
                    riskLevel = 'high-risk';
                    reasoning.push('Kohonnut Tg viittaa jäljellä olevaan tautiin');
                }
            } else if (ultrasound === 'suspicious' || tgAb === 'stable') {
                category = 'Epävarma tilanne';
                recommendation = 'Tiivis seuranta, ei välttämättä uusintahoitoa';
                riskLevel = 'warning';
                if (ultrasound === 'suspicious') reasoning.push('Epäilyttävä UÄ-löydös');
                if (tgAb === 'stable') reasoning.push('TgAb koholla mutta stabiili/laskeva');
            } else {
                category = 'Biokemiallinen epätäydellinen vaste';
                recommendation = 'Uusinta radiojodihoito harkittava';
                riskLevel = 'high-risk';
                reasoning.push('Kohonnut Tg ilman normaalia UÄ-löydöstä');
            }
        } else {
            // No prior RAI
            if (ultrasound === 'normal' && suppressedTg < 0.2 && tgAb === 'negative') {
                category = 'Erinomainen vaste';
                recommendation = 'Seuranta riittää';
                riskLevel = 'benign';
                reasoning.push('Matala riski ilman radiojodihoitoa');
            } else if (suppressedTg <= 2) {
                category = 'Epävarma tilanne';
                recommendation = 'Kontrolli 6-12 kk, harkitse RAI:ta';
                riskLevel = 'warning';
                reasoning.push('Tg 0.2-2 µg/l tai TgAb koholla');
            } else {
                category = 'Biokemiallinen epätäydellinen vaste';
                recommendation = 'Radiojodihoito 1.1 GBq suositeltava';
                riskLevel = 'high-risk';
                reasoning.push('Tg >2 µg/l tai nousussa');
            }
        }

        return {
            category: category,
            recommendation: recommendation,
            riskLevel: riskLevel,
            reasoning: reasoning
        };
    }

    function displayResponseResult(result, suppressedTg, stimulatedTg, tgAb, ultrasound) {
        responseRecommendationDiv.textContent = result.category;
        responseRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Arvio:</h3>';
        rationaleHTML += '<p><strong>Tyroksiinin aikainen Tg:</strong> ' + suppressedTg.toFixed(2) + ' µg/l</p>';
        if (stimulatedTg !== null) {
            rationaleHTML += '<p><strong>Stimuloitu Tg:</strong> ' + stimulatedTg.toFixed(2) + ' µg/l</p>';
        }
        rationaleHTML += '<p><strong>TgAb:</strong> ' + getTgAbLabel(tgAb) + '</p>';
        rationaleHTML += '<p><strong>UÄ-löydös:</strong> ' + getUltrasoundLabel(ultrasound) + '</p>';

        rationaleHTML += '<p><strong>Suositus:</strong> ' + result.recommendation + '</p>';

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        responseRationaleDiv.innerHTML = rationaleHTML;
        responseResultContainer.style.display = 'block';
        responseResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function getTgAbLabel(value) {
        const labels = {
            'negative': 'Negatiivinen',
            'stable': 'Koholla, stabiili/laskeva',
            'rising': 'Koholla, nousussa'
        };
        return labels[value] || value;
    }

    function getUltrasoundLabel(value) {
        const labels = {
            'normal': 'Normaali',
            'suspicious': 'Epäilyttävä löydös',
            'positive': 'Selvä tauti'
        };
        return labels[value] || value;
    }

    // TSH Targets form handling (6.3)
    const tshForm = document.getElementById('tshForm');
    const tshResultContainer = document.getElementById('tshResult');
    const tshRecommendationDiv = document.getElementById('tshRecommendation');
    const tshRationaleDiv = document.getElementById('tshRationale');

    if (tshForm) {
        // Toggle visibility of risk vs response fields
        const responseAssessedRadios = document.querySelectorAll('input[name="responseAssessed"]');
        responseAssessedRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                const riskGroup = document.getElementById('riskCategoryGroup');
                const responseGroup = document.getElementById('responseStatusGroup');
                if (this.value === 'yes') {
                    riskGroup.style.display = 'none';
                    responseGroup.style.display = 'block';
                } else {
                    riskGroup.style.display = 'block';
                    responseGroup.style.display = 'none';
                }
            });
        });

        tshForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const surgeryType = document.querySelector('input[name="surgeryType"]:checked').value;
            const responseAssessed = document.querySelector('input[name="responseAssessed"]:checked').value;
            const riskCategory = document.querySelector('input[name="riskCategory"]:checked');
            const responseStatus = document.querySelector('input[name="responseStatus"]:checked');

            const result = determineTSHTarget(surgeryType, responseAssessed,
                riskCategory ? riskCategory.value : null,
                responseStatus ? responseStatus.value : null);
            displayTSHResult(result, surgeryType, responseAssessed);
        });

        tshForm.addEventListener('reset', function() {
            tshResultContainer.style.display = 'none';
            document.getElementById('riskCategoryGroup').style.display = 'block';
            document.getElementById('responseStatusGroup').style.display = 'none';
        });
    }

    function determineTSHTarget(surgeryType, responseAssessed, riskCategory, responseStatus) {
        let target = '';
        let reasoning = [];
        let riskLevel = 'low-risk';

        if (surgeryType === 'lobectomy') {
            target = '0.5-2.0 mU/l';
            reasoning.push('Lobektomia - aina matalan riskin hoitolinja');
            reasoning.push('Normaali TSH-tavoite riittää');
            riskLevel = 'benign';
        } else if (responseAssessed === 'no') {
            // Pre-response assessment
            if (riskCategory === 'high') {
                target = '<0.1 mU/l';
                reasoning.push('Korkean riskin potilas - TSH-suppressio tarpeen');
                reasoning.push('Pidä T3v viitealueella');
                riskLevel = 'high-risk';
            } else {
                target = '0.1-0.5 mU/l';
                reasoning.push('Matalan/kohtalaisen riskin potilas ennen vastearviota');
                riskLevel = 'warning';
            }
        } else {
            // Post-response assessment
            switch (responseStatus) {
                case 'excellent':
                    target = '0.5-2.0 mU/l';
                    reasoning.push('Erinomainen vaste - normaali TSH-tavoite riittää');
                    riskLevel = 'benign';
                    break;
                case 'indeterminate':
                case 'biochemical':
                    target = '0.1-0.5 mU/l';
                    reasoning.push('Epävarma/epätäydellinen vaste - lievä suppressio');
                    riskLevel = 'warning';
                    break;
                case 'structural':
                    target = '<0.1 mU/l';
                    reasoning.push('Mitattavaa tautia jäljellä - TSH-suppressio tarpeen');
                    reasoning.push('Pidä T3v viitealueella');
                    riskLevel = 'high-risk';
                    break;
            }
        }

        return {
            target: target,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayTSHResult(result, surgeryType, responseAssessed) {
        tshRecommendationDiv.textContent = 'TSH-tavoite: ' + result.target;
        tshRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Suositus:</h3>';
        rationaleHTML += '<p><strong>Leikkaustyyppi:</strong> ' + (surgeryType === 'lobectomy' ? 'Lobektomia' : 'Totaaliresektio') + '</p>';
        rationaleHTML += '<p><strong>Vastearvio:</strong> ' + (responseAssessed === 'yes' ? 'Tehty' : 'Ei vielä') + '</p>';

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        rationaleHTML += '<p><strong>Muistettavaa:</strong></p><ul>';
        rationaleHTML += '<li>Annoksen muutostarpeen arvio 6-8 viikon kuluttua</li>';
        rationaleHTML += '<li>Suppressiohoito voi altistaa osteoporoosille ja sydän-verisuonitaudeille</li>';
        rationaleHTML += '</ul>';

        tshRationaleDiv.innerHTML = rationaleHTML;
        tshResultContainer.style.display = 'block';
        tshResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Genetic Predisposition form handling (8.1)
    const geneticForm = document.getElementById('geneticForm');
    const geneticResultContainer = document.getElementById('geneticResult');
    const geneticRecommendationDiv = document.getElementById('geneticRecommendation');
    const geneticRationaleDiv = document.getElementById('geneticRationale');

    if (geneticForm) {
        geneticForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const affectedRelatives = document.getElementById('affectedRelatives').value;
            const youngestAgeInput = document.getElementById('youngestAge').value;
            const youngestAge = youngestAgeInput ? parseInt(youngestAgeInput) : null;
            const syndromeFeatures = Array.from(document.querySelectorAll('input[name="syndromeFeature"]:checked'))
                .map(cb => cb.value);

            const result = determineGeneticScreening(affectedRelatives, youngestAge, syndromeFeatures);
            displayGeneticResult(result, affectedRelatives, youngestAge, syndromeFeatures);
        });

        geneticForm.addEventListener('reset', function() {
            geneticResultContainer.style.display = 'none';
        });
    }

    function determineGeneticScreening(affectedRelatives, youngestAge, syndromeFeatures) {
        let recommendation = '';
        let screeningProtocol = '';
        let geneticTesting = false;
        let reasoning = [];
        let riskLevel = 'low-risk';

        // Check for syndrome features first
        if (syndromeFeatures.length > 0) {
            geneticTesting = true;
            recommendation = 'Geneettinen tutkimus suositeltava';
            riskLevel = 'high-risk';
            reasoning.push('Kasvainalttiusoireyhtymän piirteitä todettu');
            reasoning.push('Konsultoi kliinisen genetiikan yksikköä');
            screeningProtocol = 'Vuosittainen kilpirauhasen UÄ oireyhtymän kantajille';
        }
        // Then check family history
        else if (affectedRelatives === '3') {
            recommendation = 'Vuosittainen kilpirauhasen UÄ-seuranta';
            riskLevel = 'high-risk';
            reasoning.push('≥3 sairastunutta suvussa - 99% todennäköisyydellä familiaalinen tauti');
            reasoning.push('Perustuu ATA/NIH-suositukseen');

            if (youngestAge !== null) {
                const screeningStart = Math.max(10, youngestAge - 10);
                screeningProtocol = 'Aloitus ' + screeningStart + ' vuoden iässä tai 20 vuoden iässä (kumpi tulee ensin)';
            } else {
                screeningProtocol = 'Aloitus 20 vuoden iässä tai 10 vuotta ennen suvun nuorimman sairastumisikää';
            }
        } else if (affectedRelatives === '2') {
            recommendation = 'Kaulan palpaatio, ei rutiini-UÄ-seulontaa';
            riskLevel = 'warning';
            reasoning.push('2 sairastunutta suvussa - sporadisen taudin osuus ~50%');
            reasoning.push('Rutiininomaista UÄ-seulontaa ei suositella');
            screeningProtocol = 'Kliininen seuranta, UÄ oireiden ilmaantuessa';
        } else if (affectedRelatives === '1') {
            recommendation = 'Ei erityistä seulontaa';
            riskLevel = 'low-risk';
            reasoning.push('Yksittäinen sairastunut suvussa - ei viitettä familiaaliseen tautiin');
            screeningProtocol = 'Normaali terveydenhuolto';
        } else {
            recommendation = 'Ei erityistä seulontaa';
            riskLevel = 'benign';
            reasoning.push('Ei sukurasitusta');
            screeningProtocol = 'Normaali terveydenhuolto';
        }

        return {
            recommendation: recommendation,
            screeningProtocol: screeningProtocol,
            geneticTesting: geneticTesting,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayGeneticResult(result, affectedRelatives, youngestAge, syndromeFeatures) {
        geneticRecommendationDiv.textContent = result.recommendation;
        geneticRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Seulontasuositus:</h3>';
        rationaleHTML += '<p><strong>Sairastuneet sukulaiset:</strong> ' + getRelativesLabel(affectedRelatives) + '</p>';
        if (youngestAge !== null) {
            rationaleHTML += '<p><strong>Nuorimman sairastumisikä:</strong> ' + youngestAge + ' vuotta</p>';
        }

        if (result.geneticTesting) {
            rationaleHTML += '<p><strong>Geneettinen tutkimus:</strong> Suositeltava</p>';
        }

        rationaleHTML += '<p><strong>Seulontaprotokolla:</strong> ' + result.screeningProtocol + '</p>';

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        if (syndromeFeatures.length > 0) {
            rationaleHTML += '<p><strong>Oireyhtymäpiirteet:</strong></p><ul>';
            syndromeFeatures.forEach(feature => {
                rationaleHTML += '<li>' + getSyndromeLabel(feature) + '</li>';
            });
            rationaleHTML += '</ul>';
        }

        geneticRationaleDiv.innerHTML = rationaleHTML;
        geneticResultContainer.style.display = 'block';
        geneticResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function getRelativesLabel(value) {
        const labels = {
            '0': 'Ei yhtään',
            '1': '1 sukulainen',
            '2': '2 sukulaista',
            '3': '3 tai enemmän'
        };
        return labels[value] || value;
    }

    function getSyndromeLabel(value) {
        const labels = {
            'fap': 'FAP/Gardner (GI-polyypit, osteoomat)',
            'cowden': 'Cowden (hamartoomat, rintasyöpäalttius)',
            'carney': 'Carney (endokriinikasvaimet)',
            'werner': 'Werner (sarkoomat, progeria)',
            'dicer1': 'DICER1 (blastooma, monikyhmystruuma)'
        };
        return labels[value] || value;
    }

    // Pregnancy form handling (8.2)
    const pregnancyForm = document.getElementById('pregnancyForm');
    const pregnancyResultContainer = document.getElementById('pregnancyResult');
    const pregnancyRecommendationDiv = document.getElementById('pregnancyRecommendation');
    const pregnancyRationaleDiv = document.getElementById('pregnancyRationale');

    if (pregnancyForm) {
        // Toggle visibility of conditional fields
        const scenarioRadios = document.querySelectorAll('input[name="pregnancyScenario"]');
        scenarioRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                const trimesterGroup = document.getElementById('trimesterGroup');
                const tumorGroup = document.getElementById('tumorFeaturesGroup');
                const diseaseGroup = document.getElementById('diseaseStatusGroup');
                const postTreatmentGroup = document.getElementById('postTreatmentGroup');

                trimesterGroup.style.display = 'none';
                tumorGroup.style.display = 'none';
                diseaseGroup.style.display = 'none';
                postTreatmentGroup.style.display = 'none';

                if (this.value === 'newDiagnosis') {
                    trimesterGroup.style.display = 'block';
                    tumorGroup.style.display = 'block';
                } else if (this.value === 'previousTreatment') {
                    diseaseGroup.style.display = 'block';
                } else if (this.value === 'planningPregnancy') {
                    postTreatmentGroup.style.display = 'block';
                }
            });
        });

        pregnancyForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const scenario = document.querySelector('input[name="pregnancyScenario"]:checked').value;
            const trimester = document.querySelector('input[name="trimester"]:checked');
            const features = Array.from(document.querySelectorAll('input[name="pregnancyFeature"]:checked'))
                .map(cb => cb.value);
            const diseaseStatus = document.querySelector('input[name="diseaseStatus"]:checked');
            const lastTreatment = document.querySelector('input[name="lastTreatment"]:checked');

            const result = determinePregnancyManagement(scenario,
                trimester ? trimester.value : null,
                features,
                diseaseStatus ? diseaseStatus.value : null,
                lastTreatment ? lastTreatment.value : null);
            displayPregnancyResult(result, scenario);
        });

        pregnancyForm.addEventListener('reset', function() {
            pregnancyResultContainer.style.display = 'none';
            document.getElementById('trimesterGroup').style.display = 'none';
            document.getElementById('tumorFeaturesGroup').style.display = 'none';
            document.getElementById('diseaseStatusGroup').style.display = 'none';
            document.getElementById('postTreatmentGroup').style.display = 'none';
        });
    }

    function determinePregnancyManagement(scenario, trimester, features, diseaseStatus, lastTreatment) {
        let recommendation = '';
        let tshTarget = '';
        let followUp = '';
        let reasoning = [];
        let riskLevel = 'low-risk';

        if (scenario === 'newDiagnosis') {
            const hasHighRiskFeatures = features.includes('symptoms') || features.includes('lymphNodes') ||
                                       features.includes('growth') || features.includes('invasion');

            if (hasHighRiskFeatures) {
                if (trimester === 'second') {
                    recommendation = 'Leikkaushoito suositeltava 2. raskauskolmanneksella';
                    reasoning.push('Korkean riskin piirteitä todettu');
                    reasoning.push('2. raskauskolmannes on optimaalinen leikkausajankohta');
                    riskLevel = 'high-risk';
                } else if (trimester === 'first') {
                    recommendation = 'Tiivis seuranta, leikkaus 2. kolmanneksella jos progressio';
                    reasoning.push('1. kolmanneksella spontaanin keskenmenon riski kohonnut');
                    reasoning.push('Seuraa UÄ:llä 1. kolmanneksen lopussa');
                    riskLevel = 'warning';
                } else {
                    recommendation = 'Leikkaus synnytyksen jälkeen';
                    reasoning.push('3. kolmanneksella ennenaikaisen synnytyksen riski');
                    reasoning.push('Jos tauti pysyy stabiilina, leikkaus synnytyksen jälkeen');
                    riskLevel = 'warning';
                }
                tshTarget = '0.3-2.0 mU/l';
            } else {
                recommendation = 'Seuranta, leikkaus synnytyksen jälkeen';
                reasoning.push('Ei korkean riskin piirteitä');
                reasoning.push('UÄ-seuranta joka raskauskolmanneksessa');
                tshTarget = 'Jos TSH >2 mU/l, harkitse levotyroksiinia (tavoite 0.3-2.0 mU/l)';
                riskLevel = 'low-risk';
            }
            followUp = 'UÄ joka raskauskolmanneksessa';
        } else if (scenario === 'previousTreatment') {
            switch (diseaseStatus) {
                case 'cured':
                    recommendation = 'Normaali raskausseuranta';
                    tshTarget = '0.5-2.5 mU/l';
                    followUp = 'Rutiini-Tg/UÄ-seurantaa ei tarvita raskausaikana';
                    reasoning.push('Tautivapaa potilas - normaali hypotyreosin hoito');
                    reasoning.push('Raskaus ei lisää uusiutumisriskiä');
                    riskLevel = 'benign';
                    break;
                case 'indeterminate':
                    recommendation = 'Seuranta raskausaikana';
                    tshTarget = 'Ennen raskautta asetettu tavoite';
                    followUp = 'UÄ + Tg raskausaikana';
                    reasoning.push('Epävarma tilanne - seuranta tarpeen');
                    riskLevel = 'warning';
                    break;
                case 'active':
                    recommendation = 'Tiivis seuranta, TSH-suppressio';
                    tshTarget = '<0.1 mU/l';
                    followUp = 'UÄ + Tg joka raskauskolmanneksessa';
                    reasoning.push('Aktiivinen tauti - TSH-suppressio läpi raskauden');
                    reasoning.push('T3v pidettävä viitealueella');
                    riskLevel = 'high-risk';
                    break;
            }
            reasoning.push('Nosta levotyroksiiniannosta 25-50 µg heti raskauden alettua');
        } else if (scenario === 'planningPregnancy') {
            if (lastTreatment === 'rai') {
                recommendation = 'Odota vähintään 6 kk radiojodihoidosta';
                reasoning.push('Varoaika vähintään 6 kk, mieluiten 12 kk remission varmistamiseksi');
                reasoning.push('Miehillä varoaika 3-6 kk');
                riskLevel = 'warning';
            } else if (lastTreatment === 'breastfeeding') {
                recommendation = 'Lopeta imetys 2-3 kk ennen mahdollista RAI:ta';
                reasoning.push('Radiojodihoito vasta-aiheinen imetyksen aikana');
                reasoning.push('Imetyksen lopetus kabergoliinilla');
                riskLevel = 'warning';
            } else {
                recommendation = 'Raskaus mahdollinen leikkauksen jälkeen';
                reasoning.push('Ei erityistä varoaikaa pelkän leikkauksen jälkeen');
                reasoning.push('Varmista TSH <2.5 mU/l ennen raskautta');
                riskLevel = 'benign';
            }
        }

        return {
            recommendation: recommendation,
            tshTarget: tshTarget,
            followUp: followUp,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayPregnancyResult(result, scenario) {
        pregnancyRecommendationDiv.textContent = result.recommendation;
        pregnancyRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Hoitosuositus:</h3>';

        if (result.tshTarget) {
            rationaleHTML += '<p><strong>TSH-tavoite:</strong> ' + result.tshTarget + '</p>';
        }
        if (result.followUp) {
            rationaleHTML += '<p><strong>Seuranta:</strong> ' + result.followUp + '</p>';
        }

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        rationaleHTML += '<p><strong>Muistettavaa:</strong></p><ul>';
        rationaleHTML += '<li>Radiojodihoito on ehdottomasti vasta-aiheinen raskauden aikana</li>';
        rationaleHTML += '<li>TKI-lääkkeet ovat teratogeenisia</li>';
        if (scenario !== 'planningPregnancy') {
            rationaleHTML += '<li>Tyroksiinin tarve lisääntyy 30-50% raskauden aikana</li>';
        }
        rationaleHTML += '</ul>';

        pregnancyRationaleDiv.innerHTML = rationaleHTML;
        pregnancyResultContainer.style.display = 'block';
        pregnancyResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Thyroglobulin Interpretation form handling (8.3)
    const tgForm = document.getElementById('tgForm');
    const tgResultContainer = document.getElementById('tgResult');
    const tgRecommendationDiv = document.getElementById('tgRecommendation');
    const tgRationaleDiv = document.getElementById('tgRationale');

    if (tgForm) {
        tgForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const tgType = document.querySelector('input[name="tgType"]:checked').value;
            const tgValue = parseFloat(document.getElementById('tgValue').value);
            const tgAbStatus = document.querySelector('input[name="tgAbStatus"]:checked').value;
            const tgTrend = document.querySelector('input[name="tgTrend"]:checked').value;

            const result = interpretTg(tgType, tgValue, tgAbStatus, tgTrend);
            displayTgResult(result, tgType, tgValue, tgAbStatus, tgTrend);
        });

        tgForm.addEventListener('reset', function() {
            tgResultContainer.style.display = 'none';
        });
    }

    function interpretTg(tgType, tgValue, tgAbStatus, tgTrend) {
        let interpretation = '';
        let recommendation = '';
        let reasoning = [];
        let riskLevel = 'low-risk';

        // Check for TgAb interference
        if (tgAbStatus !== 'negative') {
            reasoning.push('TgAb koholla - Tg-arvo voi olla virheellisen matala');
            if (tgAbStatus === 'positive-rising') {
                interpretation = 'Nouseva TgAb - aktiivinen tauti todennäköinen';
                recommendation = 'Radiojodihoito harkittava, kuvantaminen tarpeen';
                riskLevel = 'high-risk';
                reasoning.push('Nouseva TgAb viittaa aktiiviseen kilpirauhassyöpään');
                reasoning.push('TgAb:n seuranta 3-6 kk välein');
            }
        }

        // If TgAb is not rising, interpret based on Tg value
        if (tgAbStatus !== 'positive-rising') {
            if (tgType === 'suppressed') {
                if (tgValue < 0.2) {
                    interpretation = 'Erinomainen vaste';
                    recommendation = 'Seuranta, ei uusintahoitoja';
                    riskLevel = 'benign';
                    reasoning.push('Suppressoitu Tg <0.2 µg/l - matala uusimisriski');
                } else if (tgValue <= 1) {
                    interpretation = 'Epävarma tilanne';
                    recommendation = 'Tiivis seuranta, kontrolli 6-12 kk';
                    riskLevel = 'warning';
                    reasoning.push('Suppressoitu Tg 0.2-1 µg/l');
                } else {
                    interpretation = 'Biokemiallinen epätäydellinen vaste';
                    recommendation = 'Kuvantaminen ja radiojodihoito harkittava';
                    riskLevel = 'high-risk';
                    reasoning.push('Suppressoitu Tg >1 µg/l viittaa jäljellä olevaan tautiin');
                }
            } else {
                // Stimulated Tg
                if (tgValue < 1) {
                    interpretation = 'Erinomainen vaste';
                    recommendation = 'Seuranta, ei uusintahoitoja';
                    riskLevel = 'benign';
                    reasoning.push('Stimuloitu Tg <1 µg/l - matala uusimisriski');
                } else if (tgValue <= 10) {
                    interpretation = 'Epävarma tilanne';
                    recommendation = 'Kontrolli 6-12 kk, seuraa trendiä';
                    riskLevel = 'warning';
                    reasoning.push('Stimuloitu Tg 1-10 µg/l');
                } else if (tgValue <= 20) {
                    interpretation = 'Biokemiallinen epätäydellinen vaste';
                    recommendation = 'Radiojodihoito yleensä perusteltu';
                    riskLevel = 'high-risk';
                    reasoning.push('Stimuloitu Tg >10 µg/l viittaa jäljellä olevaan tautiin');
                } else {
                    interpretation = 'Korkean riskin tilanne';
                    recommendation = 'Radiojodihoito ja laaja kuvantaminen';
                    riskLevel = 'high-risk';
                    reasoning.push('Stimuloitu Tg >20 µg/l - korkea uusimisriski');
                }
            }
        }

        // Check trend
        if (tgTrend === 'rising') {
            if (riskLevel !== 'high-risk') {
                riskLevel = 'warning';
            }
            reasoning.push('Nouseva Tg viittaa korkeaan uusimisriskiin');
            if (tgValue > 1) {
                recommendation = 'Kuvantaminen (UÄ, TT/MRI, mahdollisesti PET-TT)';
            }
        } else if (tgTrend === 'decreasing') {
            reasoning.push('Laskeva Tg on hyvä merkki');
        }

        return {
            interpretation: interpretation,
            recommendation: recommendation,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayTgResult(result, tgType, tgValue, tgAbStatus, tgTrend) {
        tgRecommendationDiv.textContent = result.interpretation;
        tgRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Tulkinta:</h3>';
        rationaleHTML += '<p><strong>Mittaustyyppi:</strong> ' + (tgType === 'suppressed' ? 'Suppressoitu' : 'Stimuloitu') + '</p>';
        rationaleHTML += '<p><strong>Tg-arvo:</strong> ' + tgValue.toFixed(2) + ' µg/l</p>';
        rationaleHTML += '<p><strong>TgAb:</strong> ' + getTgAbStatusLabel(tgAbStatus) + '</p>';
        rationaleHTML += '<p><strong>Trendi:</strong> ' + getTgTrendLabel(tgTrend) + '</p>';

        rationaleHTML += '<p><strong>Suositus:</strong> ' + result.recommendation + '</p>';

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        if (result.riskLevel === 'high-risk' && tgValue > 1) {
            rationaleHTML += '<p><strong>Kohonneen Tg:n selvittely:</strong></p><ol>';
            rationaleHTML += '<li>Kaulan ultraäänitutkimus</li>';
            rationaleHTML += '<li>Kaulan MRI tai TT</li>';
            if (tgValue > 10) {
                rationaleHTML += '<li>PET-TT (erityisesti Tg >10 µg/l)</li>';
            }
            rationaleHTML += '<li>Koko kehon gammakuvaus diagnostisella radiojodiannoksella</li>';
            rationaleHTML += '</ol>';
        }

        tgRationaleDiv.innerHTML = rationaleHTML;
        tgResultContainer.style.display = 'block';
        tgResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    function getTgAbStatusLabel(value) {
        const labels = {
            'negative': 'Negatiivinen',
            'positive-stable': 'Koholla, stabiili/laskeva',
            'positive-rising': 'Koholla, nousussa'
        };
        return labels[value] || value;
    }

    function getTgTrendLabel(value) {
        const labels = {
            'decreasing': 'Laskeva',
            'stable': 'Stabiili',
            'rising': 'Nousussa',
            'first': 'Ensimmäinen mittaus'
        };
        return labels[value] || value;
    }

    // Repeat Surgery form handling (7.1)
    const repeatSurgeryForm = document.getElementById('repeatSurgeryForm');
    const repeatSurgeryResultContainer = document.getElementById('repeatSurgeryResult');
    const repeatSurgeryRecommendationDiv = document.getElementById('repeatSurgeryRecommendation');
    const repeatSurgeryRationaleDiv = document.getElementById('repeatSurgeryRationale');

    if (repeatSurgeryForm) {
        repeatSurgeryForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const locations = Array.from(document.querySelectorAll('input[name="recurrenceLocation"]:checked'))
                .map(cb => cb.value);
            const nodeSize = parseInt(document.getElementById('nodeSize').value);
            const previousSurgery = document.querySelector('input[name="previousSurgery"]:checked').value;
            const fnacConfirmed = document.querySelector('input[name="fnacConfirmed"]:checked').value;

            const result = determineRepeatSurgery(locations, nodeSize, previousSurgery, fnacConfirmed);
            displayRepeatSurgeryResult(result, locations, nodeSize);
        });

        repeatSurgeryForm.addEventListener('reset', function() {
            repeatSurgeryResultContainer.style.display = 'none';
        });
    }

    function determineRepeatSurgery(locations, nodeSize, previousSurgery, fnacConfirmed) {
        let recommendation = '';
        let surgeryType = '';
        let reasoning = [];
        let riskLevel = 'warning';

        const isCentral = locations.includes('central');
        const isLateral = locations.includes('lateral');
        const isThyroidBed = locations.includes('thyroidBed');

        // Check if surveillance is appropriate based on size
        const centralThreshold = 8;
        const lateralThreshold = 10;

        if (fnacConfirmed === 'no') {
            recommendation = 'Tee ensin ONB-varmistus';
            surgeryType = 'Diagnoosi ensin';
            reasoning.push('ONB-varmistus tarvitaan ennen leikkauspäätöstä');
            reasoning.push('Kaulan MRI/TT ennen toimenpiteitä');
            riskLevel = 'warning';
        } else if (fnacConfirmed === 'suspicious') {
            recommendation = 'Harkitse uusinta-ONB tai leikkausta';
            surgeryType = 'Diagnoosi/leikkaus';
            reasoning.push('Epävarma ONB-tulos - harkitse uusintaa');
            reasoning.push('Jos kliininen epäily vahva, leikkaus perusteltua');
            riskLevel = 'warning';
        } else {
            // FNAC confirmed malignant
            if (isCentral && nodeSize < centralThreshold && !isLateral && !isThyroidBed) {
                recommendation = 'Seuranta mahdollinen';
                surgeryType = 'UÄ-seuranta 3-6 kk välein';
                reasoning.push('Sentraalialueen pieni (<8 mm) metastaasi');
                reasoning.push('Aktiivinen seuranta mahdollinen valituilla potilailla');
                riskLevel = 'low-risk';
            } else if (isLateral && nodeSize < lateralThreshold && !isCentral && !isThyroidBed) {
                recommendation = 'Seuranta mahdollinen';
                surgeryType = 'UÄ-seuranta 3-6 kk välein';
                reasoning.push('Lateraalialueen pieni (<10 mm) metastaasi');
                reasoning.push('Aktiivinen seuranta mahdollinen valituilla potilailla');
                riskLevel = 'low-risk';
            } else {
                recommendation = 'Leikkaushoito suositeltava';
                riskLevel = 'high-risk';

                if (isCentral) {
                    if (previousSurgery === 'yes') {
                        surgeryType = 'Leesion poisto (berry picking)';
                        reasoning.push('Sentraalialue aiemmin leikattu - kohdennettu poisto');
                    } else {
                        surgeryType = 'Tason VI tyhjennys';
                        reasoning.push('Sentraalialueen systemaattinen tyhjennys');
                    }
                    reasoning.push('Neuromonitorointi aiheellista');
                }

                if (isLateral) {
                    if (previousSurgery === 'yes') {
                        surgeryType = (surgeryType ? surgeryType + ' + ' : '') + 'Kohdennettu lateraalinen poisto';
                        reasoning.push('Lateraalialue aiemmin leikattu - kohdennettu poisto');
                    } else {
                        surgeryType = (surgeryType ? surgeryType + ' + ' : '') + 'Kauladissektio IIa-III-IV-Vb';
                        reasoning.push('Lateraalialueen systemaattinen dissektio');
                    }
                }

                if (isThyroidBed) {
                    surgeryType = (surgeryType ? surgeryType + ' + ' : '') + 'Kilpirauhasalueen revisio';
                    reasoning.push('Kilpirauhasen leikkausalueen uusiutuma');
                }
            }
        }

        reasoning.push('Hoito keskitettävä yliopistosairaalaan');

        return {
            recommendation: recommendation,
            surgeryType: surgeryType,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayRepeatSurgeryResult(result, locations, nodeSize) {
        repeatSurgeryRecommendationDiv.textContent = result.recommendation;
        repeatSurgeryRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Hoitosuositus:</h3>';
        rationaleHTML += '<p><strong>Solmukkeen koko:</strong> ' + nodeSize + ' mm</p>';
        rationaleHTML += '<p><strong>Toimenpide:</strong> ' + result.surgeryType + '</p>';

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        repeatSurgeryRationaleDiv.innerHTML = rationaleHTML;
        repeatSurgeryResultContainer.style.display = 'block';
        repeatSurgeryResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Repeat RAI form handling (7.2)
    const repeatRaiForm = document.getElementById('repeatRaiForm');
    const repeatRaiResultContainer = document.getElementById('repeatRaiResult');
    const repeatRaiRecommendationDiv = document.getElementById('repeatRaiRecommendation');
    const repeatRaiRationaleDiv = document.getElementById('repeatRaiRationale');

    if (repeatRaiForm) {
        repeatRaiForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const stimTg = parseFloat(document.getElementById('stimTgLevel').value);
            const tgTrend = document.querySelector('input[name="tgTrendRai"]:checked').value;
            const tgAbStatus = document.querySelector('input[name="tgAbRai"]:checked').value;
            const metastases = document.querySelector('input[name="metastases"]:checked').value;
            const iodineAvid = document.querySelector('input[name="iodineAvid"]:checked').value;

            const result = determineRepeatRai(stimTg, tgTrend, tgAbStatus, metastases, iodineAvid);
            displayRepeatRaiResult(result, stimTg, metastases);
        });

        repeatRaiForm.addEventListener('reset', function() {
            repeatRaiResultContainer.style.display = 'none';
        });
    }

    function determineRepeatRai(stimTg, tgTrend, tgAbStatus, metastases, iodineAvid) {
        let recommendation = '';
        let dose = '';
        let reasoning = [];
        let riskLevel = 'low-risk';

        // Check if RAI-refractory
        if (iodineAvid === 'no') {
            recommendation = 'Radiojodihoito ei ole indisoitu';
            dose = 'Ei RAI:ta';
            reasoning.push('Radiojodirefraktaari tauti - pesäkkeet eivät kerää radiojodia');
            reasoning.push('Harkitse ulkoista sädehoitoa tai systeemistä lääkehoitoa');
            riskLevel = 'warning';
        } else {
            // Check for distant metastases
            if (metastases === 'lungMicro') {
                recommendation = 'RAI-sarjahoito suositeltava';
                dose = '3.7 GBq × 3 (4-6 kk välein)';
                reasoning.push('Mikronodulaarinen keuhkometastasointi');
                reasoning.push('Kuratiivinen hoitotulos mahdollinen');
                riskLevel = 'high-risk';
            } else if (metastases === 'lungMacro' || metastases === 'bone' || metastases === 'other') {
                recommendation = 'RAI-sarjahoito + mahdollisesti paikallishoito';
                dose = '3.7 GBq × 3 (4-6 kk välein)';
                reasoning.push('Etäpesäkkeet todettu - tarvitaan monimodaalinen hoito');
                if (metastases === 'bone') {
                    reasoning.push('Luustometastaasit vaativat aina myös ulkoista sädehoitoa');
                }
                riskLevel = 'high-risk';
            } else {
                // No distant metastases - base on Tg levels
                if (stimTg >= 10) {
                    recommendation = 'Radiojodihoito suositeltava';
                    dose = '3.7 GBq';
                    reasoning.push('Biokemiallinen epätäydellinen vaste (stim. Tg ≥10 µg/l)');
                    riskLevel = 'high-risk';
                } else if (stimTg >= 1 && stimTg < 10) {
                    if (tgTrend === 'rising') {
                        recommendation = 'Radiojodihoito harkittava';
                        dose = '3.7 GBq';
                        reasoning.push('Epävarma tilanne nousevalla Tg-trendillä');
                        riskLevel = 'warning';
                    } else {
                        recommendation = 'Kontrolli 6-12 kk';
                        dose = 'Ei RAI:ta vielä';
                        reasoning.push('Epävarma tilanne (stim. Tg 1-10 µg/l)');
                        reasoning.push('Seuranta tiivis, RAI jos selvä nousu');
                        riskLevel = 'warning';
                    }
                } else {
                    recommendation = 'Ei RAI-tarvetta';
                    dose = 'Seuranta riittää';
                    reasoning.push('Matala Tg-taso (stim. Tg <1 µg/l)');
                    riskLevel = 'benign';
                }
            }

            // Check TgAb
            if (tgAbStatus === 'rising') {
                recommendation = 'Radiojodihoito suositeltava';
                dose = '3.7 GBq';
                reasoning.push('Nouseva TgAb viittaa aktiiviseen syöpään');
                riskLevel = 'high-risk';
            }
        }

        return {
            recommendation: recommendation,
            dose: dose,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayRepeatRaiResult(result, stimTg, metastases) {
        repeatRaiRecommendationDiv.textContent = result.recommendation;
        repeatRaiRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Hoitosuositus:</h3>';
        rationaleHTML += '<p><strong>Stimuloitu Tg:</strong> ' + stimTg.toFixed(1) + ' µg/l</p>';
        rationaleHTML += '<p><strong>RAI-annos:</strong> ' + result.dose + '</p>';

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        if (result.riskLevel === 'high-risk') {
            rationaleHTML += '<p><strong>Muistettavaa:</strong></p><ul>';
            rationaleHTML += '<li>Vähäjodinen ruokavalio 2 viikkoa ennen hoitoa</li>';
            rationaleHTML += '<li>TSH-stimulaatio rhTSH:lla tai tyroksiinivieroituksella</li>';
            rationaleHTML += '<li>33 GBq kumulatiivista turvallisuusrajaa voidaan ylittää yksilöllisesti</li>';
            rationaleHTML += '</ul>';
        }

        repeatRaiRationaleDiv.innerHTML = rationaleHTML;
        repeatRaiResultContainer.style.display = 'block';
        repeatRaiResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // External Radiation form handling (7.3)
    const radiationForm = document.getElementById('radiationForm');
    const radiationResultContainer = document.getElementById('radiationResult');
    const radiationRecommendationDiv = document.getElementById('radiationRecommendation');
    const radiationRationaleDiv = document.getElementById('radiationRationale');

    if (radiationForm) {
        radiationForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const target = document.querySelector('input[name="radiationTarget"]:checked').value;
            const lesionCount = document.querySelector('input[name="lesionCount"]:checked').value;
            const raiResponse = document.querySelector('input[name="raiResponse"]:checked').value;
            const surgeryPossible = document.querySelector('input[name="surgeryPossible"]:checked').value;
            const symptoms = Array.from(document.querySelectorAll('input[name="symptoms"]:checked'))
                .map(cb => cb.value);

            const result = determineRadiation(target, lesionCount, raiResponse, surgeryPossible, symptoms);
            displayRadiationResult(result, target);
        });

        radiationForm.addEventListener('reset', function() {
            radiationResultContainer.style.display = 'none';
        });
    }

    function determineRadiation(target, lesionCount, raiResponse, surgeryPossible, symptoms) {
        let recommendation = '';
        let technique = '';
        let reasoning = [];
        let riskLevel = 'warning';

        const isOligomet = lesionCount === 'single' || lesionCount === 'oligo';
        const hasSymptoms = symptoms.length > 0;

        if (surgeryPossible === 'yes' && (lesionCount === 'single' || target === 'neck')) {
            recommendation = 'Harkitse ensin leikkaushoitoa';
            technique = 'Kirurgia ensisijainen';
            reasoning.push('Leikkauskelpoiset leesiot - kirurgia ensisijainen');
            riskLevel = 'low-risk';
        } else if (raiResponse === 'avid' && !hasSymptoms && target !== 'bone') {
            recommendation = 'Harkitse ensin radiojodihoitoa';
            technique = 'RAI ensisijainen';
            reasoning.push('Radiojodia keräävä tauti - RAI ensisijainen hoitomuoto');
            riskLevel = 'low-risk';
        } else {
            // Radiation indicated
            if (target === 'neck') {
                recommendation = 'Ulkoinen sädehoito aiheellinen';
                technique = 'IMRT 54-70 Gy';
                reasoning.push('Kaulan sädehoito indisoitu');
                if (raiResponse === 'refractory') {
                    reasoning.push('Radiojodirefraktaari kaulatauti');
                }
                riskLevel = 'high-risk';
            } else if (target === 'brain') {
                if (lesionCount === 'multiple') {
                    recommendation = 'Kokoaivojen sädehoito';
                    technique = 'WBRT tai SRS + WBRT';
                    reasoning.push('>4 aivometastaasia - kokoaivojen hoito harkittava');
                } else {
                    recommendation = 'Stereotaktinen sädehoito';
                    technique = 'SRS/SRT';
                    reasoning.push('≤4 aivometastaasia - stereotaktinen hoito suositeltava');
                }
                riskLevel = 'high-risk';
            } else if (target === 'bone') {
                recommendation = 'Ulkoinen sädehoito + RAI (jos kerää)';
                technique = 'EBRT 30-40 Gy + RAI';
                reasoning.push('Luustometastaasit vaativat AINA ulkoista sädehoitoa RAI:n lisäksi');
                if (symptoms.includes('fracture')) {
                    reasoning.push('Murtumariski kantavassa luussa');
                }
                riskLevel = 'high-risk';
            } else if (isOligomet && raiResponse === 'refractory') {
                recommendation = 'Stereotaktinen sädehoito';
                technique = 'SBRT/SABR';
                reasoning.push('Oligometastaattinen radiojodirefraktaari tauti');
                reasoning.push('Voi viivästyttää systeemisen lääkehoidon tarvetta');
                riskLevel = 'warning';
            } else {
                recommendation = 'Palliatiivinen sädehoito harkittava';
                technique = 'Yksilöllinen annos';
                reasoning.push('Oireenmukaiseen hoitoon');
                if (hasSymptoms) {
                    reasoning.push('Oireita aiheuttavat pesäkkeet');
                }
                riskLevel = 'warning';
            }
        }

        return {
            recommendation: recommendation,
            technique: technique,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displayRadiationResult(result, target) {
        radiationRecommendationDiv.textContent = result.recommendation;
        radiationRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Hoitosuositus:</h3>';
        rationaleHTML += '<p><strong>Tekniikka:</strong> ' + result.technique + '</p>';

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        radiationRationaleDiv.innerHTML = rationaleHTML;
        radiationResultContainer.style.display = 'block';
        radiationResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    // Systemic Therapy form handling (7.4)
    const systemicForm = document.getElementById('systemicForm');
    const systemicResultContainer = document.getElementById('systemicResult');
    const systemicRecommendationDiv = document.getElementById('systemicRecommendation');
    const systemicRationaleDiv = document.getElementById('systemicRationale');

    if (systemicForm) {
        systemicForm.addEventListener('submit', function(e) {
            e.preventDefault();

            const raiStatus = document.querySelector('input[name="raiStatus"]:checked').value;
            const progression = document.querySelector('input[name="progression"]:checked').value;
            const localControl = document.querySelector('input[name="localControl"]:checked').value;
            const burden = Array.from(document.querySelectorAll('input[name="burden"]:checked'))
                .map(cb => cb.value);
            const molecular = Array.from(document.querySelectorAll('input[name="molecular"]:checked'))
                .map(cb => cb.value);

            const result = determineSystemicTherapy(raiStatus, progression, localControl, burden, molecular);
            displaySystemicResult(result, molecular);
        });

        systemicForm.addEventListener('reset', function() {
            systemicResultContainer.style.display = 'none';
        });
    }

    function determineSystemicTherapy(raiStatus, progression, localControl, burden, molecular) {
        let recommendation = '';
        let drug = '';
        let reasoning = [];
        let riskLevel = 'low-risk';

        const hasBurden = burden.length > 0;
        const isSymptomatic = burden.includes('symptomatic');
        const isSignificant = burden.includes('significant');
        const isThreatening = burden.includes('threatening');

        if (raiStatus === 'responsive') {
            recommendation = 'Jatka radiojodihoitoa';
            drug = 'RAI ensisijainen';
            reasoning.push('Radiojodia keräävä tauti - jatka RAI-hoitoa');
            riskLevel = 'benign';
        } else if (localControl === 'yes') {
            recommendation = 'Paikallishoito ensisijainen';
            drug = 'Kirurgia/sädehoito';
            reasoning.push('Tauti hallittavissa paikallishoidolla');
            riskLevel = 'low-risk';
        } else if (progression === 'stable' && !hasBurden) {
            recommendation = 'Aktiivinen seuranta';
            drug = 'Ei lääkehoitoa';
            reasoning.push('Stabiili tauti ilman oireita tai merkittävää tautitaakkaa');
            reasoning.push('Pelkkä Tg-nousu EI riitä TKI-indikaatioksi');
            riskLevel = 'benign';
        } else if (progression === 'slow' && !isSymptomatic && !isThreatening) {
            recommendation = 'Seuranta, harkitse lääkehoitoa';
            drug = 'Ei vielä';
            reasoning.push('Hidas progressio - seuranta mahdollinen');
            reasoning.push('Aloita lääkehoito jos progressio nopeutuu tai oireet ilmaantuvat');
            riskLevel = 'warning';
        } else {
            // TKI indicated
            recommendation = 'Systeeminen lääkehoito indisoitu';
            riskLevel = 'high-risk';

            if (molecular.includes('ntrk')) {
                drug = 'Larotrektinibi tai Entrektinibi';
                reasoning.push('NTRK-fuusiopositiivinen kasvain');
                reasoning.push('Kohdennettu hoito ensisijainen');
            } else if (molecular.includes('ret')) {
                drug = 'Selperkatinibi';
                reasoning.push('RET-fuusiopositiivinen kasvain');
                reasoning.push('Kohdennettu hoito ensisijainen');
            } else {
                drug = 'Lenvatinibi (24 mg × 1) tai Sorafenibi (400 mg × 2)';
                reasoning.push('Ensilinjan TKI-hoito');
            }

            reasoning.push('Radiojodirefraktaari, etenevä tauti');
            if (isSymptomatic) reasoning.push('Oireinen potilas');
            if (isSignificant) reasoning.push('Merkittävä tautitaakka');
            if (isThreatening) reasoning.push('Henkeä uhkaava sijainti');
        }

        return {
            recommendation: recommendation,
            drug: drug,
            reasoning: reasoning,
            riskLevel: riskLevel
        };
    }

    function displaySystemicResult(result, molecular) {
        systemicRecommendationDiv.textContent = result.recommendation;
        systemicRecommendationDiv.className = 'recommendation ' + result.riskLevel;

        let rationaleHTML = '<h3>Hoitosuositus:</h3>';
        rationaleHTML += '<p><strong>Lääke:</strong> ' + result.drug + '</p>';

        rationaleHTML += '<p><strong>Perustelut:</strong></p><ul>';
        result.reasoning.forEach(reason => {
            rationaleHTML += '<li>' + reason + '</li>';
        });
        rationaleHTML += '</ul>';

        if (result.riskLevel === 'high-risk') {
            rationaleHTML += '<p><strong>Seuranta TKI-hoidon aikana:</strong></p><ul>';
            rationaleHTML += '<li>Verenpaine, laboratoriokokeet, ihohaitat</li>';
            rationaleHTML += '<li>Annosta joudutaan usein vähentämään</li>';
            rationaleHTML += '<li>Tyroksiinin tarve voi kasvaa</li>';
            rationaleHTML += '</ul>';

            if (molecular.length === 0) {
                rationaleHTML += '<p><strong>Harkitse molekyylipatologista tutkimusta:</strong> NTRK, RET, BRAF</p>';
            }
        }

        systemicRationaleDiv.innerHTML = rationaleHTML;
        systemicResultContainer.style.display = 'block';
        systemicResultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
});

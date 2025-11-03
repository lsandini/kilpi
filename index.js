document.addEventListener('DOMContentLoaded', function() {
    // Collapsible menu handling
    const collapsibles = document.querySelectorAll('.nav-section-title.collapsible');

    collapsibles.forEach(collapsible => {
        collapsible.addEventListener('click', function(e) {
            e.stopPropagation();
            this.classList.toggle('expanded');
        });
    });

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
});

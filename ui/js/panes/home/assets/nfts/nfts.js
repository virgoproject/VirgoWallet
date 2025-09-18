class HomeNFTs extends StatefulElement {

    render() {
        return `
            <div class="text-center mt-4">
                <img src="../images/nftsoon.png" id="img">
                <p id="title" class="mt-3 text-lg mb-1">${Stateful.t("NFTsMaintenanceTitle")}</p>
                <p id="subtitle">${Stateful.t("NFTsMaintenanceSub")}</p>
            </div>
        `;
    }

    style() {
        return `
            
            #img {
                height: 64px;
            }
        
            #title {
                color: var(--gray-700);
                font-weight: 600;
            }
            
            #subtitle {
                color: var(--gray-400);
            }
        `;
    }

}

Stateful.define("home-nfts", HomeNFTs)

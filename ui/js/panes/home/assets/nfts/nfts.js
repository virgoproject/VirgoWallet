class HomeNFTs extends StatefulElement {

    render() {
        return `
            <div class="text-center mt-4">
                <img src="../images/nftsoon.png" id="img">
                <p id="title" class="mt-3 text-lg mb-1">Ongoing maintenance!</p>
                <p id="subtitle">Your NFTs will appear here soon</p>
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

import pandas as pd


class InputData:
    def __init__(self):
        self.wlDF = pd.read_csv('WATERLEVEL.csv')
        self.rdDF = pd.read_csv('DISCHARGE.csv')
    
    def getData(self,state,district):
        wl = self.wlDF[(self.wlDF['state']==state) & (self.wlDF['district']==district)]['datatype_code'].mean()
        rd = self.rdDF[(self.rdDF['state']==state) & (self.rdDF['district']==district)]['datatype_code'].mean()
        return wl, rd


if __name__=="__main__":
    wlDF = pd.read_csv('WATERLVL.csv')

    print(wlDF.head())

    state = 'Kerala'.upper()
    district = 'KANNUR'

    wl = wlDF[(wlDF['state'].str.upper()==state) & (wlDF['district']==district)]

    print(wl['datatype_code'].mean())

    wl2 = wlDF[(wlDF['state']==state) & (wlDF['district']==district)]['datatype_code'].mean()
    print(wl2)
    print()

    obj = InputData()
    r1, r2 = obj.getData(state='Kerala',district="IDUKKI")
    print(r1,r2)